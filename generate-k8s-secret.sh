set -e

ENV_FILE=".env"
SECRET_FILE="k8s/secret.yaml"       
SECRET_EXAMPLE="k8s/secret.example.yaml"  

if [ ! -f "$ENV_FILE" ]; then
  echo "No se encontró el archivo .env en el directorio actual."
  echo "   Ejecuta este script desde la raíz del proyecto backend."
  exit 1
fi

source <(grep -v '^#' "$ENV_FILE" | grep -v '^\s*$')

b64() {
  echo -n "$1" | base64
}

echo " Generando $SECRET_FILE con valores reales..."

cat > "$SECRET_FILE" <<EOF
# ARCHIVO GENERADO AUTOMÁTICAMENTE — NO COMMITEAR AL REPOSITORIO
# Generado el: $(date)
apiVersion: v1
kind: Secret
metadata:
  name: backend-secrets
  namespace: getonboard
  labels:
    app: getonboard-backend
type: Opaque
data:
  DB_HOST: $(b64 "$DB_HOST")
  DB_USER: $(b64 "$DB_USER")
  DB_PASSWORD: $(b64 "$DB_PASSWORD")
  DB_NAME: $(b64 "$DB_NAME")
  JWT_SECRET: $(b64 "$JWT_SECRET")
  JWT_REFRESH_SECRET: $(b64 "${JWT_REFRESH_SECRET:-$JWT_SECRET}")
  CLOUDINARY_CLOUD_NAME: $(b64 "$CLOUDINARY_CLOUD_NAME")
  CLOUDINARY_API_KEY: $(b64 "$CLOUDINARY_API_KEY")
  CLOUDINARY_API_SECRET: $(b64 "$CLOUDINARY_API_SECRET")
EOF

echo "$SECRET_FILE generado correctamente."
echo "Recuerda: este archivo tiene valores reales. NO lo commitees."
