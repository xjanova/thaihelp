#!/bin/bash
# ThaiHelp Server Setup Script
# Run on a fresh Ubuntu/Debian server

set -e

APP_NAME="thaihelp"
DOMAIN="thaihelp.xman4289.com"

echo "========================================="
echo "  ThaiHelp Server Setup"
echo "========================================="

# 1. Install Node.js 20
echo "Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 2. Install PM2
echo "Installing PM2..."
sudo npm install -g pm2

# 3. Create app directory
sudo mkdir -p /var/www/${APP_NAME}
sudo chown -R $USER:$USER /var/www/${APP_NAME}
sudo mkdir -p /var/backups/${APP_NAME}

# 4. Nginx config
echo "Configuring Nginx..."
sudo tee /etc/nginx/sites-available/${APP_NAME} > /dev/null <<EOF
server {
    listen 80;
    server_name ${DOMAIN};

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/${APP_NAME} /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# 5. SSL with Let's Encrypt
echo "Setting up SSL..."
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d ${DOMAIN} --non-interactive --agree-tos --email admin@${DOMAIN} || echo "SSL setup requires valid DNS"

# 6. PM2 startup
pm2 startup systemd -u $USER --hp /home/$USER
pm2 save

echo ""
echo "========================================="
echo "  Server setup complete!"
echo "  Next: run ./scripts/deploy.sh"
echo "========================================="
