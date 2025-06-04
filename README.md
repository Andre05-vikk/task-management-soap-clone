# Task Management SOAP Clone

SOAP teenus, mis peegeldab REST API funktsionaalsust. Teenus pakub autentimist, kasutajahaldust ja ülesannete haldust.


## Nõuded

- Node.js (v14 või uuem)
- npm (v6 või uuem)

## Paigaldamine

### SOAP API sõltuvused

Paigalda SOAP API sõltuvused:

```bash
npm install
```

### REST API seadistamine (võrdlustestide jaoks)

Võrdlustestide käivitamiseks on vaja ka REST API-t. Seadista see järgmiselt:

```bash
cd notion-clone-api
npm install
```

**Märkus:** REST API vajab MariaDB andmebaasi. Vaata detailseid juhiseid: [notion-clone-api/README.md](notion-clone-api/README.md)

## Käivitamine

Teenuse käivitamiseks kasuta järgmist käsku:

```bash
./scripts/run.sh
```

või

```bash
node src/index.js
```

Teenus käivitub aadressil http://localhost:8000/task-service

WSDL on kättesaadav aadressil http://localhost:8000/task-service?wsdl

## Kliendi näide

Kliendi näite käivitamiseks:

```bash
node client/example.js
```


## Testimine

### SOAP API testid

Automaattestide käivitamiseks:

```bash
./tests/test.sh
```

See skript käivitab teenuse (kui see pole juba käivitatud) ja käivitab testid, mis kontrollivad kõiki SOAP operatsioone.

### REST vs SOAP API võrdlustestid

Automatiseeritud testid, mis tõestavad REST ja SOAP API-de funktsionaalse võrdväärsuse:

```bash
npm run test:equivalence:full
```

**Eeldused võrdlustestide jaoks:**
- MariaDB andmebaas peab olema paigaldatud ja käivitatud
- REST API andmebaas peab olema seadistatud (vaata notion-clone-api/README.md)

**Alternatiiv:** Kui mõlemad API-d on juba käivitatud:
```bash
npm run test:equivalence
```

Rohkem infot testide kohta: [tests/README.md](tests/README.md)


## Vaikimisi kasutaja

Teenus loob käivitamisel vaikimisi administraatori konto:

- Kasutajanimi: `admin`
- Parool: `admin123`
