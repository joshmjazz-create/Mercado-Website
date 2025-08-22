# 🌐 Custom Domain Configuration Guide

## Why Add Both Domains?

When planning to use a custom domain, you should configure **both** the GitHub Pages domain AND your custom domain in your Google API key restrictions. This ensures:

✅ **Seamless transition** - No API downtime when switching domains  
✅ **Testing flexibility** - Test on GitHub Pages before DNS switch  
✅ **Backup access** - GitHub Pages URL remains functional  
✅ **Development continuity** - Consistent API access during setup  

## Google API Key Domain Configuration

### Recommended Domain List:
```
https://joshmjazz-create.github.io/*          # GitHub Pages
https://joshuamercado.com/*                   # Your custom domain  
https://www.joshuamercado.com/*               # WWW version
http://localhost:*                            # Local development
http://127.0.0.1:*                            # Local development alt
```

### Step-by-Step:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to: APIs & Services → Credentials
3. Click on your API key
4. Under "Application restrictions":
   - Select "HTTP referrers (web sites)"
   - Add ALL the domains above (replace with your actual domain)

## GitHub Pages Custom Domain Setup

### Method 1: GitHub UI
1. Repository Settings → Pages
2. Under "Custom domain", enter: `joshuamercado.com`
3. Check "Enforce HTTPS" (after DNS propagation)

### Method 2: GitHub Actions (Automated)
I've already configured this in `.github/workflows/deploy.yml`:
```yaml
cname: joshuamercado.com  # Replace with your actual domain
```

## DNS Configuration

### Option A: CNAME Record (Recommended)
```
Type: CNAME
Name: www (or @)
Value: joshmjazz-create.github.io
```

### Option B: A Records
```
Type: A
Name: @
Value: 185.199.108.153
Value: 185.199.109.153  
Value: 185.199.110.153
Value: 185.199.111.153
```

## Domain Transition Timeline

### Phase 1: Preparation (Before DNS Change)
- ✅ Add both domains to Google API restrictions
- ✅ Test site on GitHub Pages: `joshmjazz-create.github.io/Mercado-Website`
- ✅ Configure custom domain in GitHub Pages settings

### Phase 2: DNS Switch
- 🔄 Update DNS records with your domain provider
- 🔄 Wait for DNS propagation (24-48 hours)
- 🔄 Test custom domain functionality

### Phase 3: Verification
- ✅ Verify custom domain loads correctly
- ✅ Test Google API functionality on custom domain
- ✅ Enable HTTPS enforcement
- ✅ GitHub Pages URL continues to work as backup

## Testing Your Setup

### Before DNS Change:
```bash
# Test GitHub Pages URL
curl -I https://joshmjazz-create.github.io/Mercado-Website

# Check API functionality in browser dev tools
```

### After DNS Change:
```bash
# Test custom domain
curl -I https://joshuamercado.com

# Test HTTPS redirect
curl -I http://joshuamercado.com
```

## Troubleshooting

### "API calls failing on custom domain"
- Verify custom domain is added to Google API key restrictions
- Check browser console for CORS errors
- Ensure HTTPS is working on custom domain

### "DNS not resolving"
- Allow 24-48 hours for full DNS propagation
- Test DNS resolution: `nslookup joshuamercado.com`
- Try different DNS servers (8.8.8.8, 1.1.1.1)

### "GitHub Pages shows 404"
- Ensure CNAME file is present in gh-pages branch (GitHub Actions handles this)
- Verify custom domain spelling in repository settings
- Check GitHub Pages build status in repository Actions tab

## Best Practices

1. **Always include both domains** in API restrictions
2. **Test thoroughly** on GitHub Pages before DNS switch  
3. **Keep GitHub Pages URL** as backup access
4. **Monitor API quotas** during transition
5. **Enable HTTPS** for security and SEO
6. **Use CNAME records** for easier GitHub Pages integration

## Professional Domain Recommendations

For Joshua Mercado's jazz website:
- `joshuamercado.com` - Primary domain
- `www.joshuamercado.com` - WWW redirect
- `joshmercado.com` - Alternative (optional)

This configuration ensures your website remains professional and accessible throughout any domain changes while maintaining full Google API functionality.