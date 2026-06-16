#!/bin/bash
# ==============================================================================
# load-test-hpa.sh
# Simula tráfico al backend para demostrar el autoescalado (HPA)
#
# Uso:
#   chmod +x load-test-hpa.sh
#   ./load-test-hpa.sh
#
# En otra terminal, monitorea el HPA con:
#   watch -n 2 kubectl get hpa -n getonboard
# ==============================================================================

NAMESPACE="getonboard"
BACKEND_PORT="3001"
DURATION=120      # segundos de carga
CONCURRENCY=50    # peticiones paralelas

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║   HPA Load Test — GetOnBoardUCB Backend              ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""
echo "⚙️  Asegúrate de tener el port-forward activo en otra terminal:"
echo "   kubectl port-forward svc/getonboard-backend-svc 3001:80 -n $NAMESPACE"
echo ""
read -p "   Presiona ENTER cuando estés listo para iniciar la carga..."
echo ""

# ── Verificar que el backend responde ──────────────────────────────────────────
echo "▶ Verificando que el backend está activo..."
if ! curl -sf "http://localhost:$BACKEND_PORT/health" > /dev/null; then
  echo "❌ El backend no responde en http://localhost:$BACKEND_PORT/health"
  echo "   Verifica que el port-forward esté activo."
  exit 1
fi
echo "   ✅ Backend activo"
echo ""

# ── Monitoreo del HPA en background ───────────────────────────────────────────
echo "▶ Iniciando monitoreo del HPA en background..."
(
  for i in $(seq 1 $((DURATION / 5))); do
    echo ""
    echo "--- HPA Status (t=${i}x5s) ---"
    kubectl get hpa getonboard-backend-hpa -n "$NAMESPACE" 2>/dev/null || true
    kubectl get pods -n "$NAMESPACE" -l app=getonboard-backend 2>/dev/null | grep -c Running | xargs echo "Pods Running:"
    sleep 5
  done
) &
MONITOR_PID=$!

# ── Generar carga ─────────────────────────────────────────────────────────────
echo "▶ Generando carga ($CONCURRENCY peticiones paralelas por ${DURATION}s)..."
echo "   Endpoints probados: /health, /api/offers"
echo ""

END_TIME=$((SECONDS + DURATION))
REQUEST_COUNT=0

while [ $SECONDS -lt $END_TIME ]; do
  # Lanzar peticiones en paralelo
  for i in $(seq 1 $CONCURRENCY); do
    curl -sf "http://localhost:$BACKEND_PORT/health" > /dev/null &
    curl -sf "http://localhost:$BACKEND_PORT/api/offers" > /dev/null &
  done
  wait
  REQUEST_COUNT=$((REQUEST_COUNT + CONCURRENCY * 2))
  echo -ne "\r   📊 Peticiones enviadas: $REQUEST_COUNT | Tiempo restante: $((END_TIME - SECONDS))s"
done

echo ""
echo ""
kill $MONITOR_PID 2>/dev/null || true

# ── Resultado final ───────────────────────────────────────────────────────────
echo "▶ Resultado final del HPA:"
kubectl get hpa -n "$NAMESPACE"
echo ""
kubectl get pods -n "$NAMESPACE"
echo ""
echo "✅ Load test completado. Total peticiones: $REQUEST_COUNT"
echo ""
echo "📸 Captura estas pantallas como evidencia del autoescalado para la documentación."
