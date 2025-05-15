# Task Management SOAP Clone

SOAP teenus, mis peegeldab REST API funktsionaalsust. Teenus pakub autentimist, kasutajahaldust ja ülesannete haldust.

## Projekti struktuur

```
/project-root
 ├── wsdl/              # WSDL ja XSD failid
 ├── src/               # Lähtekood
 ├── scripts/run.sh     # Käivitusskript
 ├── client/example.js  # Kliendi näide
 ├── tests/test.sh      # Automaattestid
 └── README.md          # Dokumentatsioon
```

## Nõuded

- Node.js (v14 või uuem)
- npm (v6 või uuem)

## Paigaldamine

Paigalda sõltuvused:

```bash
npm install
```

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

Automaattestide käivitamiseks:

```bash
./tests/test.sh
```

See skript käivitab teenuse (kui see pole juba käivitatud) ja käivitab testid, mis kontrollivad kõiki SOAP operatsioone.

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
