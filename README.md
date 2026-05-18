# 🍴 Eatlist

> לא שואלים יותר לאן הולכים לאכול. פותחים Eatlist.

---

## 🤔 מה זה בכלל?

אפליקציית **Eatlist** היא אפליקציית ווב בה משתמשים מנהלים רשימות של מסעדות.
משתמש יוצר Eatlist (רשימת מסעדות), מוסיף מסעדות לרשימה, מסדר אותן לפי סדר עדיפויות, מוסיף הערות — ועכשיו יש לו מקום אחד נקי לכל ההמלצות שלו.
אפשר לשתף את הרשימות עם אחרים, לעקוב אחרי רשימות של משתמשים שונים, ולסמן מסעדות אהובות.

---

## ✨ פונקציונליות עיקרית

### 🗂️ Eatlists
- יצירה, עריכה ומחיקה של Eatlists
- הוספה והסרה של מסעדות מרשימה
- סידור מסעדות לפי סדר עדיפויות
- הוספת הערות אישיות לכל מסעדה ברשימה
- הגדרת רשימה כפומבית או פרטית
- מעקב אחרי Eatlists של משתמשים אחרים

### 🍽️ מסעדות
- צפייה בכל המסעדות עם תצוגת כרטיסים או טבלה
- סינון לפי ז'אנר וחיפוש חופשי
- סימון מסעדות אהובות
- צפייה בפרטי מסעדה — כתובת, טלפון, תפריט, אינסטגרם ועוד

### 👤 משתמשים
- הרשמה, התחברות וניהול הרשימות המקושרות לפרופיל
- ספרייה אישית עם Eatlists שנוצרו על ידי המשתמש או נעקבו על ידו
- עמוד "מסעדות שאהבתי"
- חיפוש גלובלי במסעדות וב-Eatlists

### 🔐 אדמין
- ניהול מסעדות — הוספה, עריכה ומחיקה
- ניהול משתמשים - עריכה ומחיקה

---

## 🛠️ טכנולוגיות

### Frontend
| טכנולוגיה | שימוש |
|---|---|
| React + TypeScript | ממשק משתמש |
| React Router | ניווט |
| Formik + Yup | טפסים ווולידציה |
| Axios | קריאות API |
| SweetAlert2 | התראות |

### Backend
| טכנולוגיה | שימוש |
|---|---|
| Node.js + Express | שרת |
| MongoDB + Mongoose | מסד נתונים |
| JWT + bcrypt | אימות והצפנה |
| Joi | ולידציה |
| Morgan | לוגים |

---

## 🚀 הפעלה מקומית

### דרישות מקדימות
- Node.js
- MongoDB Atlas או MongoDB מקומי

### התקנה

**שרת:**
```bash
cd eatlist-server
npm install
npm run dev
```

**קליינט:**
```bash
cd eatlist-client
npm install
npm start
```

### משתני סביבה
קובץ `.env` מצורף בתיקיות הקליינט והשרת 

---

## 📁 מבנה הפרויקט

```
eatlist/
├── eatlist-client/        # React frontend
│   ├── src/
│   │   ├── components/    # רכיבי UI
│   │   ├── interfaces/    # טיפוסי TypeScript
│   │   ├── services/      # קריאות API
│   │   ├── hooks/         # Custom hooks
│   │   └── style/         # קבצי CSS
│
└── eatlist-server/        # Express backend
    ├── routes/            # נתיבי API
    ├── models/            # מודלי Mongoose
    ├── middlewares/       # Auth, logger
    └── server.js
```

---

## 🔌 API עיקרי

| Method | Endpoint | תיאור |
|---|---|---|
| GET | `/api/restaurants` | צפייה בכל המסעדות |
| GET | `/api/restaurants/:id` | צפייה במסעדה אחת |
| PUT | `/api/restaurants/:id` | עדכון מסעדה אחת |
| PATCH | `/api/restaurants/:id` | לייק/אנלייק |

| GET | `/api/eatlists` | צפייה בכל ה-Eatlists |
| GET | `/api/eatlists/:id` | צפייה ב-Eatlist אחת |
| POST | `/api/eatlists` | יצירת Eatlist |
| PATCH | `/api/eatlists/:id/update` | עדכון Eatlist |
| PATCH | `/api/eatlists/:id/follow` | עקוב/הפסק לעקוב |
| POST | `/api/eatlists/:id/restaurants` | הוספת מסעדה ל-Eatlist |

| POST | `/api/users` | הרשמה |
| POST | `/api/users/login` | התחברות |

---

*נבנה במסגרת פרויקט גמר — HackerU* 🎓
