# Hafiz Wedding Equipment — Shared Wedding Scheduler

یہ Excel نہیں ہے۔ یہ ایک single-page, mobile-friendly web app ہے جس میں SQLite database استعمال ہوتا ہے۔

## Default login
- Login ID: `admin`
- Password: `1234`

پہلی production deployment سے پہلے password اور SESSION_SECRET ضرور تبدیل کریں۔

## Run
1. Node.js 18+ انسٹال کریں۔
2. اس folder میں terminal کھولیں۔
3. `npm install`
4. `npm start`
5. Browser میں `http://localhost:3000` کھولیں۔

## Included
- ایک login ID
- Shared SQLite database
- Mobile-friendly single page
- Total Events / Dates / Today
- Date-wise event cards
- ایک تاریخ پر 2–3 یا زیادہ events
- Mehndi / Baraat / Walima / Nikah / Other
- Venue, time, assigned team
- Customer name/phone
- Package اور notes
- Search + event filter
- Add / Edit / Delete
- Team کے کئی موبائل devices ایک ہی deployed server/database کے ذریعے ایک ہی data دیکھ سکتے ہیں

## Production
اسے کسی Node hosting/VPS پر deploy کریں اور ایک ہی URL ٹیم کے ساتھ share کریں۔ SQLite file (`wedding.db`) server پر رہے گی۔
