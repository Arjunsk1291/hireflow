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
echo "Demo accounts:"
echo "  admin@avenir.com     / Admin@1234  (Master Admin)"
echo "  hr@avenir.com        / Hr@12345    (HR Manager)"
echo "  recruiter@avenir.com / Rec@1234    (Recruiter)"
echo "  dept@avenir.com      / Dept@1234   (Department Head)"
echo "  finance@avenir.com   / Fin@1234    (Finance)"
echo "  interviewer@avenir.com / Int@1234  (Interviewer)"
echo "  officer@avenir.com   / Off@1234    (HR Officer)"
