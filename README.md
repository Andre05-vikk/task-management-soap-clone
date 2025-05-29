# Task Management SOAP Clone

SOAP teenus, mis peegeldab REST API funktsionaalsust. Teenus pakub autentimist, kasutajahaldust ja ülesannete haldust.

## Projekti struktuur

```
/project-root
 ├── wsdl/                    # WSDL ja XSD failid
 ├── src/                     # SOAP API lähtekood
 ├── scripts/run.sh           # SOAP API käivitusskript
 ├── client/example.js        # SOAP kliendi näide
 ├── tests/                   # Testid
 │   ├── test.sh              # SOAP API testid
 │   ├── equivalence-tests.js # REST vs SOAP võrdlustestid
 │   └── README.md            # Testide dokumentatsioon
 ├── notion-clone-api/        # Originaal REST API (võrdluseks)
 └── README.md                # Dokumentatsioon
```

**Märkus:** `notion-clone-api` kaust sisaldab originaal REST API-t, mille alusel SOAP API loodi. See on vajalik võrdlustestide jaoks.

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

See skript demonstreerib kõiki SOAP operatsioone:
- Autentimine (Login, Logout)
- Kasutajahaldus (CreateUser, GetUsers, GetUser, UpdateUser, DeleteUser)
- Ülesannete haldus (CreateTask, GetTasks, UpdateTask, DeleteTask)

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

See skript:
- Käivitab automaatselt mõlemad API-d (REST ja SOAP)
- Käivitab võrdlustestid, mis kontrollivad funktsionaalset võrdväärsust
- Annab detailse aruande testide tulemustest

**Eeldused võrdlustestide jaoks:**
- MariaDB andmebaas peab olema paigaldatud ja käivitatud
- REST API andmebaas peab olema seadistatud (vaata notion-clone-api/README.md)

**Alternatiiv:** Kui mõlemad API-d on juba käivitatud:
```bash
npm run test:equivalence
```

Rohkem infot testide kohta: [tests/README.md](tests/README.md)

## API dokumentatsioon

### Autentimine

- **Login** - Logib kasutaja sisse ja tagastab JWT tokeni
- **Logout** - Logib kasutaja välja (kustutab sessiooni)

### Kasutajahaldus

- **CreateUser** - Loob uue kasutaja
- **GetUsers** - Tagastab kõik kasutajad
- **GetUser** - Tagastab kasutaja ID alusel
- **UpdateUser** - Uuendab kasutaja andmeid
- **DeleteUser** - Kustutab kasutajakonto

### Ülesannete haldus

- **CreateTask** - Loob uue ülesande
- **GetTasks** - Tagastab kõik ülesanded
- **UpdateTask** - Uuendab ülesannet
- **DeleteTask** - Kustutab ülesande

## Vaikimisi kasutaja

Teenus loob käivitamisel vaikimisi administraatori konto:

- Kasutajanimi: `admin`
- Parool: `admin123`

## Andmete salvestamine

Teenus kasutab mälupõhist andmehoidlat, mis tähendab, et andmed säilivad ainult teenuse töötamise ajal. Teenuse taaskäivitamisel andmed lähtestatakse.
