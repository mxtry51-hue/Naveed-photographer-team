const express = require("express");
const session = require("express-session");
const Database = require("better-sqlite3");
const path = require("path");

const app = express();
const db = new Database("wedding.db");
db.pragma("journal_mode = WAL");

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_date TEXT NOT NULL,
  event_type TEXT NOT NULL,
  venue TEXT NOT NULL,
  event_time TEXT NOT NULL,
  team TEXT NOT NULL,
  customer_name TEXT DEFAULT '',
  customer_phone TEXT DEFAULT '',
  package_name TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
`);

const user = db.prepare("SELECT id FROM users WHERE username=?").get("admin");
if (!user) db.prepare("INSERT INTO users(username,password,name) VALUES(?,?,?)")
  .run("admin","1234","Hafiz Wedding Equipment");

app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || "hafiz-wedding-change-this-secret",
  resave: false, saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: "lax", maxAge: 1000*60*60*24*7 }
}));
app.use(express.static(path.join(__dirname, "public")));

function auth(req,res,next){ if(!req.session.user) return res.status(401).json({error:"Unauthorized"}); next(); }

app.post("/api/login",(req,res)=>{
  const {username,password}=req.body||{};
  const u=db.prepare("SELECT id,name,username FROM users WHERE username=? AND password=?").get(username,password);
  if(!u) return res.status(401).json({error:"Invalid login"});
  req.session.user=u; res.json({user:u});
});
app.post("/api/logout",(req,res)=>req.session.destroy(()=>res.json({ok:true})));
app.get("/api/me",(req,res)=>res.json({user:req.session.user||null}));

app.get("/api/events",auth,(req,res)=>{
  const {from,to,q,type}=req.query;
  let sql="SELECT * FROM events WHERE 1=1", p=[];
  if(from){sql+=" AND event_date>=?";p.push(from)}
  if(to){sql+=" AND event_date<=?";p.push(to)}
  if(type){sql+=" AND event_type=?";p.push(type)}
  if(q){sql+=" AND (venue LIKE ? OR team LIKE ? OR customer_name LIKE ? OR package_name LIKE ?)";const x="%"+q+"%";p.push(x,x,x,x)}
  sql+=" ORDER BY event_date,event_time,id";
  res.json(db.prepare(sql).all(...p));
});
app.post("/api/events",auth,(req,res)=>{
  const e=req.body||{};
  if(!e.event_date||!e.event_type||!e.venue||!e.event_time||!e.team)
    return res.status(400).json({error:"Date, type, venue, time and team are required"});
  const r=db.prepare(`INSERT INTO events
    (event_date,event_type,venue,event_time,team,customer_name,customer_phone,package_name,notes)
    VALUES (?,?,?,?,?,?,?,?,?)`).run(e.event_date,e.event_type,e.venue,e.event_time,e.team,e.customer_name||"",e.customer_phone||"",e.package_name||"",e.notes||"");
  res.json(db.prepare("SELECT * FROM events WHERE id=?").get(r.lastInsertRowid));
});
app.put("/api/events/:id",auth,(req,res)=>{
  const e=req.body||{};
  db.prepare(`UPDATE events SET event_date=?,event_type=?,venue=?,event_time=?,team=?,
    customer_name=?,customer_phone=?,package_name=?,notes=? WHERE id=?`)
    .run(e.event_date,e.event_type,e.venue,e.event_time,e.team,e.customer_name||"",e.customer_phone||"",e.package_name||"",e.notes||"",req.params.id);
  res.json(db.prepare("SELECT * FROM events WHERE id=?").get(req.params.id));
});
app.delete("/api/events/:id",auth,(req,res)=>{db.prepare("DELETE FROM events WHERE id=?").run(req.params.id);res.json({ok:true})});

app.get("/api/stats",auth,(req,res)=>{
  const total=db.prepare("SELECT COUNT(*) c FROM events").get().c;
  const dates=db.prepare("SELECT COUNT(DISTINCT event_date) c FROM events").get().c;
  const today=new Date().toISOString().slice(0,10);
  const todayCount=db.prepare("SELECT COUNT(*) c FROM events WHERE event_date=?").get(today).c;
  res.json({total,dates,today:todayCount});
});

app.listen(process.env.PORT||3000,()=>console.log("Hafiz Wedding Scheduler running on http://localhost:3000"));
