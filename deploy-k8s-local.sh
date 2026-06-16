
set -e

BACKEND_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$BACKEND_DIR/../GetOnBoardUCBFrontend/get-on-board-ucb-frontend"
NAMESPACE="getonboard"
BACKEND_IMAGE="getonboard-backend:local"
FRONTEND_IMAGE="getonboard-frontend:local"

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║   GetOnBoardUCB — Despliegue Kubernetes Local        ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""

# ── 1. Verificar kubectl ──────────────────────────────────────────────────────
echo "▶ [1/7] Verificando conexión con el cluster..."
if ! kubectl cluster-info &>/dev/null; then
  echo "No hay cluster Kubernetes disponible."
  echo ""
  echo "   Opciones para habilitar uno:"
  echo "   • Docker Desktop: Settings → Kubernetes → Enable Kubernetes"
  echo "   • minikube: brew install minikube && minikube start"
  exit 1
fi
echo "   Cluster activo: $(kubectl config current-context)"
echo ""

# ── 2. Generar Secret con valores reales ─────────────────────────────────────
echo "▶ [2/7] Generando Secret con valores del .env..."
cd "$BACKEND_DIR"
bash generate-k8s-secret.sh
echo ""

# ── 3. Build de imágenes Docker ───────────────────────────────────────────────
echo "▶ [3/7] Construyendo imagen Docker del backend..."
docker build -t "$BACKEND_IMAGE" "$BACKEND_DIR"
echo "   Imagen backend: $BACKEND_IMAGE"
echo ""

echo "▶ [4/7] Construyendo imagen Docker del frontend..."
docker build -t "$FRONTEND_IMAGE" "$FRONTEND_DIR"
echo "   Imagen frontend: $FRONTEND_IMAGE"
echo ""

# Si usas minikube, cargar imágenes locales:
if kubectl config current-context 2>/dev/null | grep -q "minikube"; then
  echo "   Detectado minikube — cargando imágenes locales..."
  minikube image load "$BACKEND_IMAGE"
  minikube image load "$FRONTEND_IMAGE"
fi

# ── 4. Actualizar referencias de imagen en los Deployments ───────────────────
# Parchamos el deployment para usar imagen local (imagePullPolicy: Never)
echo "▶ [5/7] Aplicando manifiestos de Kubernetes..."
echo ""

# Backend
kubectl apply -f "$BACKEND_DIR/k8s/namespace.yaml"
kubectl apply -f "$BACKEND_DIR/k8s/configmap.yaml"
kubectl apply -f "$BACKEND_DIR/k8s/secret.yaml"

# Parcheamos la imagen y pullPolicy para uso local
kubectl apply -f "$BACKEND_DIR/k8s/deployment.yaml"
kubectl patch deployment getonboard-backend -n "$NAMESPACE" \
  --type=json \
  -p='[
    {"op":"replace","path":"/spec/template/spec/containers/0/image","value":"'"$BACKEND_IMAGE"'"},
    {"op":"replace","path":"/spec/template/spec/containers/0/imagePullPolicy","value":"IfNotPresent"}
  ]'

kubectl apply -f "$BACKEND_DIR/k8s/service.yaml"
kubectl apply -f "$BACKEND_DIR/k8s/hpa.yaml"

# Frontend
kubectl apply -f "$FRONTEND_DIR/k8s/configmap.yaml"
kubectl apply -f "$FRONTEND_DIR/k8s/frontend.yaml"
kubectl patch deployment getonboard-frontend -n "$NAMESPACE" \
  --type=json \
  -p='[
    {"op":"replace","path":"/spec/template/spec/containers/0/image","value":"'"$FRONTEND_IMAGE"'"},
    {"op":"replace","path":"/spec/template/spec/containers/0/imagePullPolicy","value":"IfNotPresent"}
  ]'

echo "   Todos los manifiestos aplicados."
echo ""

# ── 5. Esperar que los pods estén listos ──────────────────────────────────────
echo "▶ [6/7] Esperando que los pods estén en estado Running..."
kubectl rollout status deployment/getonboard-backend -n "$NAMESPACE" --timeout=120s
kubectl rollout status deployment/getonboard-frontend -n "$NAMESPACE" --timeout=120s
echo ""

# ── 6. Port-forward para acceder localmente ───────────────────────────────────
echo "▶ [7/7] Estado final del despliegue:"
echo ""
kubectl get all -n "$NAMESPACE"
echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║  Despliegue completado                               ║"
echo "╠══════════════════════════════════════════════════════╣"
echo "║  Ejecuta en terminales separadas:                    ║"
echo "║                                                      ║"
echo "║  kubectl port-forward svc/getonboard-backend-svc \\  ║"
echo "║    3001:80 -n getonboard                             ║"
echo "║                                                      ║"
echo "║  kubectl port-forward svc/getonboard-frontend-svc \\ ║"
echo "║    3000:80 -n getonboard                             ║"
echo "║                                                      ║"
echo "║  Backend:  http://localhost:3001/health              ║"
echo "║  Frontend: http://localhost:3000                     ║"
echo "╚══════════════════════════════════════════════════════╝"
