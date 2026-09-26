# Website ko live kaise karein (Hostinger VPS par)

Yeh guide batati hai ke nayi Elite Escape website ko `eliteescapetourism.com` par kaise live karna hai. Poori website ek hi **Hostinger VPS** par chalegi:

| Kya | Address |
| --- | --- |
| Website aur admin panel | https://eliteescapetourism.com |
| Backend (API) | https://api.eliteescapetourism.com |
| Database | Isi VPS ke andar |
| HTTPS (taala 🔒) | Khud lag jaata hai aur khud renew hota hai, muft |

> **Email par koi asar nahi parega.** Company ki email (`@eliteescapetourism.com`, 5 mailboxes) purane Hostinger hosting plan par hai. Woh plan **cancel nahi karna**, aur DNS mein email wale records (**MX**, **TXT**) **nahi chhedne**.

Har step order mein karein. Aakhir mein "Agar koi masla aaye" wala hissa bhi hai.

---

## Step 0: Pehle se tayyar rakhein

- Client ke Hostinger account ka access (hPanel).
- Project ka sab se naya code **GitHub par push** hona chahiye. Server code wahin se lega. Yeh kaam developer karega.
- Ek GitHub **token**, taake server private code download kar sake. Developer se lein, ya khud banayein:
  GitHub → Settings → Developer settings → Personal access tokens → **Fine-grained tokens** → Generate. Sirf `elite-escape-tourism` repository chunein, **Contents: Read-only** permission dein, aur token copy karke mehfooz jagah rakh lein.

---

## Step 1: VPS khareedein

1. hPanel mein left menu se **VPS** kholein aur plan chunein. **Kam se kam 4 GB RAM** wala plan lein (Hostinger **KVM 1** ya us se upar). Website server par hi build hoti hai, aur kam RAM par build ruk sakta hai.
2. Setup ke dauran **Operating System** mein **Ubuntu 24.04 with Docker** chunein. Agar yeh option na ho to sirf **Ubuntu 24.04** chunein (neeche Step 3 mein Docker install karne ka tareeqa hai).
3. **Root password** mazboot rakhein aur likh kar mehfooz jagah rakh lein.
4. Setup mukammal hone ke baad VPS ke page par uska **IP address** nazar aayega (jaise `123.45.67.89`). Use note kar lein.

---

## Step 2: Domain ko VPS ki taraf karein (DNS)

1. hPanel → **Domains** → `eliteescapetourism.com` → **DNS / Nameservers** kholein.
2. Wahan records ki list hogi. **Sirf** yeh records badlein:

   | Type | Name | Kya karna hai |
   | --- | --- | --- |
   | `A` | `@` | Value mein VPS ka IP likhein |
   | `A` | `www` | VPS ka IP. Agar `www` ka `CNAME` record pehle se hai to use delete karke yeh `A` record banayein. |
   | `A` | `api` | **Naya** record banayein, value mein VPS ka IP |
   | `AAAA` | `@` aur `www` | **Delete** karein. Yeh purani site ke IPv6 address hain. Rehne diye to kuch logon ko purani site dikhti rahegi. |

3. **In ko bilkul na chheren:** `MX`, `TXT`, aur jin records ke naam mein `mail`, `autodiscover`, `autoconfig`, `_dmarc` ya `hostingermail` ho. Yeh sab email ke liye hain.
4. Agar purani WordPress site par **Hostinger CDN** on hai (website ke Dashboard par "CDN" ka hara nishaan), to DNS badalne se pehle use band kar dein. Warna domain purani site par hi jaata reh sakta hai.
5. DNS badalne mein 5 minute se kuch ghante lag sakte hain. Check karne ke liye https://dnschecker.org par `eliteescapetourism.com` aur `api.eliteescapetourism.com` likh kar dekhein ke VPS ka IP aa raha hai ya nahi.

---

## Step 3: Server par code lagayein

1. hPanel → **VPS** → apne VPS par **Browser terminal** ka button dabayein. Ek kaali window khulegi. Yeh server ki command window hai.
2. **Docker check karein:**

   ```
   docker --version
   ```

   Agar version number aa jaaye to aagla step karein. Agar `command not found` aaye to yeh chalayein aur khatam hone ka intezar karein:

   ```
   curl -fsSL https://get.docker.com | sh
   ```

3. **Code download karein.** `TOKEN` ki jagah apna GitHub token paste karein:

   ```
   git clone https://TOKEN@github.com/gensparkbuilds-dev/elite-escape-tourism.git /opt/eliteescape
   ```

   ```
   cd /opt/eliteescape
   ```

---

## Step 4: Settings file banayein

1. Template copy karein:

   ```
   cp deploy/.env.prod.example .env.prod
   ```

2. Teen mazboot random values banayein. Yeh command chalayein:

   ```
   for i in 1 2 3; do openssl rand -hex 24; done
   ```

   Teen lambi lines aayengi. Inhein copy karke kahin note kar lein.

3. File kholein:

   ```
   nano .env.prod
   ```

4. File mein yeh values bharein (arrow keys se upar neeche jaayein):

   | Line | Kya likhna hai |
   | --- | --- |
   | `POSTGRES_PASSWORD=` | Pehli random line |
   | `JWT_SECRET_KEY=` | Doosri random line |
   | `ADMIN_EMAIL=` | Admin panel ka login email |
   | `ADMIN_PASSWORD=` | Admin panel ka password. Kam se kam 12 characters ka ho. Isay yaad rakhein. |
   | `SITE_DOMAIN`, `API_DOMAIN` | Pehle se sahi likhe hain, na badlein |

   `CHANGE_ME` kahin bhi baaki nahi rehna chahiye.

5. Save karne ke liye **Ctrl + O**, phir **Enter**, phir band karne ke liye **Ctrl + X** dabayein.

---

## Step 5: Website chalayein

```
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
```

Pehli dafa is mein **10 se 20 minute** lag sakte hain. Command khatam hone ke baad yeh chala kar dekhein ke sab chal raha hai:

```
docker compose -f docker-compose.prod.yml --env-file .env.prod ps
```

Chaaron (`db`, `backend`, `frontend`, `caddy`) ke saamne **Up** ya **running** likha hona chahiye.

---

## Step 6: Check karein

Browser mein yeh kholein:

1. https://api.eliteescapetourism.com/api/health par `{"status":"ok"}` aana chahiye.
2. https://eliteescapetourism.com par nayi website khulni chahiye, aur address bar mein 🔒 taala hona chahiye.
3. https://www.eliteescapetourism.com par bhi website khulni chahiye (yeh khud bina `www` wale address par chala jaata hai).
4. https://eliteescapetourism.com/admin/login par Step 4 wale email aur password se login karein.
5. Website par contact form se ek test enquiry bhejein. Woh admin panel ke **Inquiries** mein nazar aani chahiye.
6. Apne Gmail se `info@eliteescapetourism.com` par ek test email bhejein, taake pakka ho ke email theek chal rahi hai.

Pehli dafa website par packages 1 minute tak purane (pehle se rakhe hue) nazar aa sakte hain. Phir khud database wale aa jaate hain.

---

## Baad mein kaam

**Nayi update live karna** (jab developer naya code GitHub par push kare). Browser terminal mein:

```
cd /opt/eliteescape && git pull && docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
```

**Database ka backup** (hafte mein ek dafa zaroor):

```
cd /opt/eliteescape && docker compose -f docker-compose.prod.yml --env-file .env.prod exec -T db pg_dump -U eliteescape eliteescape > backup-$(date +%F).sql
```

Is ke ilawa hPanel mein VPS ke **Snapshots / Backups** ka option bhi on rakhein. Is se poore server ka backup banta rehta hai, aur admin panel se upload ki hui tasveerein bhi mehfooz rehti hain.

**Purani WordPress site:** nayi site live aur test hone ke baad hi hPanel se delete karein. Sirf **website** delete karni hai, **hosting plan** nahi, kyunki email usi par hai. Delete karne se pehle Hostinger chat support se pooch lein ke is se email par koi asar to nahi parega.

---

## Agar koi masla aaye

| Kya nazar aaya | Kya karein |
| --- | --- |
| Website par purani WordPress site hi dikh rahi hai | DNS abhi update nahi hua. dnschecker.org par check karein, `AAAA` records delete kiye hain ya nahi dekhein, aur CDN band kiya hai ya nahi dekhein. Kuch ghante intezar karein. |
| Browser mein "Not secure" ya certificate ka error | Caddy ko HTTPS lene ke liye DNS ka VPS par point hona zaroori hai. DNS theek karne ke baad yeh chalayein: `docker compose -f docker-compose.prod.yml --env-file .env.prod restart caddy` |
| `backend` baar baar restart ho raha hai | Yeh chala kar wajah dekhein: `docker compose -f docker-compose.prod.yml --env-file .env.prod logs backend --tail 50`. Aksar `.env.prod` mein `CHANGE_ME` reh gaya hota hai, ya password 12 characters se chhota hota hai. |
| Build ke dauran `Killed` ya memory ka error | VPS ki RAM kam hai. Bara plan lein (hPanel mein upgrade ho jaata hai). |
| Admin login nahi hota | Password sirf **pehli dafa** chalne par save hota hai. Baad mein `.env.prod` mein badalne se login ka password nahi badalta. |
| Email band ho gayi | DNS mein `MX` ya `TXT` record badal gaya hai. Hostinger support se email ke default DNS records wapas lagwayein. |

Koi aur error aaye to terminal ki aakhri lines ka screenshot developer ko bhejein.
