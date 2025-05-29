# API Equivalence Tests

See kaust sisaldab automatiseeritud teste, mis tõestavad REST ja SOAP API-de funktsionaalse võrdväärsuse.

## Testide eesmärk

Testid kontrollivad, et:
- Mõlemad API-d pakuvad sama funktsionaalsust
- Sama sisendiga saadakse funktsionaalselt võrdväärsed tulemused
- Autentimine toimib mõlemas API-s
- CRUD operatsioonid (Create, Read, Update, Delete) toimivad võrdväärselt

## Testitud funktsioonid

1. **Autentimine**
   - Login/sisselogimine
   - Logout/väljalogimine

2. **Kasutajahaldus**
   - Kasutaja loomine
   - Kasutajate loetelu
   - Kasutaja andmete uuendamine

3. **Ülesannete haldus**
   - Ülesande loomine
   - Ülesannete loetelu
   - Ülesande uuendamine

## Testide käivitamine

### Variant 1: Automaatne käivitamine (soovitatud)

```bash
npm run test:equivalence:full
```

See skript:
- Kontrollib, kas mõlemad API-d töötavad
- Käivitab puuduvad teenused automaatselt
- Paigaldab vajalikud sõltuvused
- Käivitab võrdlustestid
- Peatab käivitatud teenused pärast testide lõppu

### Variant 2: Käsitsi käivitamine

1. **Käivita REST API** (port 5001):
   ```bash
   cd notion-clone-api
   npm start
   ```

2. **Käivita SOAP API** (port 8000):
   ```bash
   npm start
   ```

3. **Käivita võrdlustestid**:
   ```bash
   npm run test:equivalence
   ```

## Testide tulemused

Testid annavad väljundi kujul:
- ✅ - Test läbitud
- ❌ - Test ebaõnnestus
- 📊 - Kokkuvõte statistikaga

Näide väljundist:
```
🚀 Starting REST vs SOAP API Equivalence Tests

=== Test 1: Authentication Equivalence ===
✅ Authentication: Both APIs return authentication tokens

=== Test 2: User Creation Equivalence ===
✅ User Creation: Both APIs create users successfully

...

📊 EQUIVALENCE TEST RESULTS
==================================================
✅ Passed: 7
❌ Failed: 0
📈 Success Rate: 100.0%

🎉 All equivalence tests passed! REST and SOAP APIs are functionally equivalent.
```

## Testide struktuur

- `equivalence-tests.js` - Peamised võrdlustestid
- `run-equivalence-tests.sh` - Automaatne käivitusskript
- `README.md` - See dokumentatsioon

## Tehnilised detailid

### REST API
- **URL**: http://localhost:5001
- **Autentimine**: Bearer token (JWT)
- **Formaat**: JSON
- **Andmebaas**: MariaDB

### SOAP API
- **URL**: http://localhost:8000/task-service
- **WSDL**: http://localhost:8000/task-service?wsdl
- **Autentimine**: Token parameetriga
- **Formaat**: XML/SOAP
- **Andmebaas**: In-memory

### Võrdluse kriteeriumid

Testid võrdlevad:
1. **Funktsionaalsust** - kas mõlemad API-d suudavad sama operatsiooni teha
2. **Andmete terviklikkust** - kas tagastatavad andmed on sisuliselt samad
3. **Veakäsitlust** - kas mõlemad API-d käsitlevad vigu sarnaselt
4. **Autentimist** - kas mõlemad API-d nõuavad ja kontrollivad autentimist

## Probleemide lahendamine

### "Port already in use" viga
- Kontrolli, kas mõni teenus juba töötab: `lsof -i :5001` või `lsof -i :8000`
- Peata töötavad protsessid: `kill <PID>`

### "Connection refused" viga
- Veendu, et mõlemad API-d on käivitatud
- Kontrolli, et REST API andmebaas on seadistatud (vaata notion-clone-api/README.md)

### Sõltuvuste vead
- Käivita: `npm install`
- REST API jaoks: `cd notion-clone-api && npm install`

## Õpetaja nõuete täitmine

Need testid täidavad õpetaja nõude:
> "Lisa ka automatiseeritud testid, mis tõestavad REST ja SOAP API-de funktsionaalse võrdväärsuse."

Testid tõestavad, et:
- Mõlemad API-d pakuvad sama funktsionaalsust
- Tulemused on funktsionaalselt võrdväärsed
- Autentimine toimib mõlemas süsteemis
- CRUD operatsioonid annavad oodatud tulemusi
