# Elite Escape website apne computer par kaise chalayein

Yeh guide un logon ke liye hai jo programmer nahi hain. Har step ek ek karke karein, aur koi step skip na karein.

Website ke do hisse hain, aur dono ko chalana hota hai:

| Hissa | Kya karta hai | Kahan khulta hai |
| --- | --- | --- |
| **Backend** | Packages, visa, blog aur enquiries ka data rakhta hai, aur admin panel ko chalata hai | http://localhost:8000 |
| **Website** | Woh site jo customer dekhta hai | http://localhost:3000 |

---

## Hissa A: Pehli dafa ki setup (sirf ek baar karni hai)

### Step 1: Do programs install karein

1. **Docker Desktop:** https://www.docker.com/products/docker-desktop/ se download karein. Install karein, aur agar computer restart maange to restart kar dein.
2. **Node.js:** https://nodejs.org/ par **LTS** wala bara button dabayein. Install karte waqt har screen par bas **Next** dabate jayein.

### Step 2: Project ke folder mein "Command Prompt" kholein

Command Prompt ek kaali window hai jis mein aap commands likhte hain.

1. Project ka folder kholein (`EliteEscape`), jis mein yeh file bhi hai.
2. Upar address bar par click karein (jahan folder ka rasta likha hota hai).
3. Wahan likha hua mita kar `cmd` likhein aur **Enter** dabayein.
4. Ek kaali window khul jaayegi. Yeh isi folder mein khuli hogi.

> **Command kaise chalayein:** Is guide mein jo line `is tarah` box mein likhi hai, use copy karein, kaali window mein **right-click** karke paste karein, phir **Enter** dabayein.

### Step 3: Settings wali files banayein

Kaali window mein yeh do commands ek ek karke chalayein:

```
copy backend\.env.example backend\.env
```

```
copy frontend\.env.local.example frontend\.env.local
```

Har ek ke baad `1 file(s) copied.` aana chahiye.

### Step 4: Admin ka password rakhein

1. Yeh command chalayein, file Notepad mein khul jaayegi:

   ```
   notepad backend\.env
   ```

2. Is line ko dhoondein:

   ```
   ADMIN_PASSWORD=
   ```

3. `=` ke baad apna password likhein. Kam se kam 12 characters ka ho, aur beech mein space na ho. Misaal:

   ```
   ADMIN_PASSWORD=MeraPassword2026!
   ```

4. `JWT_SECRET_KEY=` wali line par bhi purana text mita kar koi lambi random line likh dein (40 se zyada characters, jaise aankh band karke keyboard dabaya ho).
5. **Ctrl + S** dabakar save karein aur Notepad band kar dein.

Admin panel mein login karne ke liye email `ADMIN_EMAIL` wali line mein likhi hai (shuru mein `admin@eliteescape.com`), aur password woh jo aapne abhi rakha.

### Step 5: Website ka saman download karein

Kaali window mein:

```
cd frontend
```

```
npm install
```

Is mein kuch minute lag sakte hain. Jab dobara likhne ki line (`>`) aa jaaye to kaam khatam hai. Beech mein peele (yellow) "warning" aayein to parwah na karein.

```
npm rebuild
```

(Yeh command is computer par zaroori hai. Is ke baghair baad mein `'next' is not recognized` ka error aa sakta hai.)

Ab yeh window band kar dein. Setup mukammal hai.

---

## Hissa B: Website chalana (har dafa)

Har dafa **do** kaali windows chahiye: ek backend ke liye, ek website ke liye. Dono ko khula rakhna hai.

### Step 1: Docker Desktop kholein

Start menu se **Docker Desktop** kholein aur intezar karein. Neeche left corner mein **"Engine running"** (hara rang) aa jaaye, tab aage barhein. Is mein ek do minute lag sakte hain.

### Step 2: Backend chalayein (pehli kaali window)

1. Project folder (`EliteEscape`) mein address bar par `cmd` likh kar Enter dabayein.
2. Yeh command chalayein:

   ```
   docker compose up --build
   ```

3. Bohat saari lines chalengi. Pehli dafa 5 se 10 minute lag sakte hain. Jab `Application startup complete` nazar aaye, backend tayyar hai.
4. **Yeh window band na karein.** Isay chhota (minimize) kar sakte hain.

Check karna ho to browser mein http://localhost:8000/docs kholein. Ek page khulna chahiye.

### Step 3: Website chalayein (doosri kaali window)

1. Project folder ke andar **`frontend`** folder kholein.
2. Address bar par `cmd` likh kar Enter dabayein.
3. Yeh command chalayein:

   ```
   npm run dev
   ```

4. Jab `Ready` likha aa jaaye, browser mein kholein: **http://localhost:3000**
5. **Yeh window bhi band na karein.**

### Step 4: Admin panel

Browser mein kholein: **http://localhost:3000/admin/login**

Email aur password woh hain jo Hissa A ke Step 4 mein rakhe the. Yahan se packages, visa countries, blog, enquiries aur website settings badal sakte hain. Badlav ek minute ke andar website par nazar aa jaate hain.

---

## Website band karna

1. Dono kaali windows mein ek ek dafa **Ctrl + C** dabayein. Agar `Terminate batch job (Y/N)?` poochhe to `Y` likh kar Enter dabayein.
2. Windows band kar dein.
3. Docker Desktop bhi band kar sakte hain.

Aapka data (packages, enquiries waghera) mehfooz rehta hai. Agli dafa sab wahin milega.

---

## Agar koi masla aaye

| Kya nazar aaya | Kya karein |
| --- | --- |
| `docker` chalane par `error during connect` ya `pipe` ka error | Docker Desktop khula nahi, ya abhi shuru ho raha hai. Use kholein, "Engine running" ka intezar karein, phir command dobara chalayein. |
| `'docker' is not recognized` | Docker Desktop install nahi hua, ya install ke baad computer restart nahi kiya. |
| `'npm' is not recognized` | Node.js install nahi hua. Hissa A ka Step 1 dobara karein, phir nayi kaali window kholein. |
| `'next' is not recognized` | `frontend` folder ki kaali window mein `npm rebuild` chalayein, phir `npm run dev`. |
| `port is already allocated` ya `address already in use` | Website pehle se kisi aur window mein chal rahi hai. Purani kaali windows band karein, ya computer restart kar dein. |
| Website khul gayi, lekin forms kaam nahi karte aur admin login nahi hota | Backend nahi chal raha. Pehli kaali window check karein (Hissa B, Step 2). Backend ke baghair website purana, pehle se rakha hua content dikhati hai. |
| Admin login mein "wrong password" | Password `backend\.env` wala hi hai, lekin sirf **pehli dafa** backend chalne par save hota hai. Baad mein file mein badalne se login ka password nahi badalta. Jo password sab se pehle rakha tha woh try karein, ya developer se reset karwayein. |
| Tasveerein dair se load hoti hain | Internet slow hai. Kuch dair baad page refresh karein. |

Is ke ilawa koi error aaye to kaali window ki aakhri lines ka screenshot le kar developer ko bhejein.
