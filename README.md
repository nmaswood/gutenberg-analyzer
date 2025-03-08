
---

# 📚 Project Gutenberg Setup Guide  

This guide walks you through setting up **Supabase**, deploying serverless functions, linking pre-existing Supabase migrations, and integrating **Google AI Studio API** for text analysis.  

---

## 🚀 Prerequisites  
Make sure you have the following installed:  
- **Node.js** (>= 16.x)  
- **npm** or **yarn**  
- **Supabase account** → [Sign up here](https://supabase.com)  
- **Google AI Studio API Key** → [Get it here](https://aistudio.google.com/app/apikey?)  

---

## 🛠️ 1. Setup Next.js Project  
Clone the repository and install dependencies:  
```sh
git clone https://github.com/palwashakmalik/gutenberg-analyzer.git
cd project-gutenberg
npm install
```

Create a **.env.local** file in the root directory and add:  
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## 🏗️ 2. Setup Supabase Project  
### 2.1. Create a Supabase Account  
1. Go to [Supabase](https://supabase.com) and sign up.  
2. Click on **New Project**.  
3. Copy the **Project URL** and **Anon Key** from the **API** section.  

### 2.2. Link Supabase Migrations  
Since the **book table** and **Supabase functions** are already configured in the directory, we just need to link them to your Supabase project.  

1. Install Supabase CLI (if not already installed):  
   ```sh
   npm install -g supabase
   supabase login
   ```
2. Initialize Supabase locally:  
   ```sh
   supabase init
   ```
3. Link the local project with your newly created Supabase project:  
   ```sh
   supabase link --project-ref your-project-ref
   ```
   Replace `your-project-ref` with the actual project reference found in your Supabase dashboard URL (e.g., `abcd1234.supabase.co`).  

4. Apply the database migrations:  
   ```sh
   supabase db push
   ```

---

## ⚡ 3. Deploy Serverless Functions  
We will deploy two functions:  
1. **book-content** → Fetches book details  
2. **text-analysis** → Performs AI-powered text analysis  

### 3.1. Deploy Functions to Supabase  
```sh
supabase functions deploy book-content
supabase functions deploy text-analysis
```

---

## 🔑 4. Setup Google AI Studio API Key  
### 4.1. Get API Key  
1. Go to [Google AI Studio API Key](https://aistudio.google.com/app/apikey?)  
2. Copy the **API Key**.  

### 4.2. Add to Supabase Function Secrets  
```sh
supabase secrets set GOOGLE_API_KEY=your-google-api-key
```

---

## ✅ 5. Run the Next.js App  
```sh
npm run dev
```
Your app should now be running at **http://localhost:3000** 🎉  

---

## 🎯 Conclusion  
You’ve successfully set up:  
✅ **Supabase Project** & linked it with Next.js  
✅ **Connected existing Supabase migrations (book table, functions)**  
✅ **Deployed Supabase functions** (`book-content` & `text-analysis`)  
✅ **Configured Google AI Studio API Key**  

Now you’re ready to build on top of this 🚀  
