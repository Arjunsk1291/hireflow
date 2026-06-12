#!/usr/bin/env bash
set -e

echo "🔧 HireFlow Setup Script"
echo "========================"

# Check Node version
NODE_VER=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VER" -lt 18 ]; then
  echo "❌ Node.js 18+ required. Found: $(node --version)"
  exit 1
fi
echo "✓ Node.js $(node --version)"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Setup environment file
if [ ! -f .env.local ]; then
  echo ""
  echo "⚙️  Creating .env.local..."
  cat > .env.local << 'ENV'
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="hireflow-super-secret-key-avenir-2024-xyz123abc"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Optional: Microsoft Graph (for email/Teams)
# AZURE_TENANT_ID=""
# AZURE_CLIENT_ID=""
# AZURE_CLIENT_SECRET=""
# GRAPH_SHARED_MAILBOX=""
# GRAPH_FROM_NAME="Avenir International Engineers"
ENV
  echo "✓ .env.local created"
else
  echo "✓ .env.local already exists"
fi

# Create uploads directory
mkdir -p uploads/cv uploads/offers uploads/signed
echo "✓ Upload directories created"

# Setup database
echo ""
echo "🗄️  Setting up database..."
DATABASE_URL="file:./dev.db" npx prisma db push
echo "✓ Database schema created"

# Seed database
echo ""
echo "🌱 Seeding demo data..."
DATABASE_URL="file:./dev.db" npx tsx prisma/seed.ts

echo ""
echo "✅ Setup complete!"
echo ""
echo "Start the app: npm run dev"
echo "Open: http://localhost:3000"
echo ""
echo "Demo accounts (all use password: Demo@2024):"
echo "  admin@avenir.com       / Demo@2024  (Master Admin)"
echo "  hr@avenir.com          / Demo@2024  (HR Manager)"
echo "  recruiter@avenir.com   / Demo@2024  (Recruiter)"
echo "  dept@avenir.com        / Demo@2024  (Department Head)"
echo "  finance@avenir.com     / Demo@2024  (Finance Approver)"
echo "  interviewer@avenir.com / Demo@2024  (Interviewer)"
echo "  officer@avenir.com     / Demo@2024  (HR Officer)"
