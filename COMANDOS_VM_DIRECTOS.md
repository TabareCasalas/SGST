# Comandos para Ejecutar Directamente en la VM Ubuntu

Ya estás dentro de la VM, así que ejecuta estos comandos directamente:

## Paso 1: Instalar Git (si no está instalado)

```bash
apt-get update
apt-get install -y git
```

## Paso 2: Clonar el repositorio

```bash
cd /opt
git clone -b taba-branch https://github.com/TabareCasalas/SGST.git sgst
cd sgst
```

## Paso 3: Hacer el script ejecutable y ejecutarlo

```bash
chmod +x deploy-local.sh
./deploy-local.sh
```

## Comandos Completos (copiar y pegar todo junto)

```bash
apt-get update && apt-get install -y git
cd /opt
git clone -b taba-branch https://github.com/TabareCasalas/SGST.git sgst
cd sgst
chmod +x deploy-local.sh
./deploy-local.sh
```

**Nota**: Si estás como root (sudo su), puedes ejecutar directamente sin sudo. Si estás como usuario normal, algunos comandos pueden requerir sudo.

