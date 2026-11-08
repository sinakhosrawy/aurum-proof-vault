# Roadmap
- [x] Public site: hero, gold code lookup -> result, candlestick visuals, contact + socials
- [x] Admin panel: login, CRUD gold codes/results, site settings (name, phone, address, socials with logos)
- [x] Live gold price monitor: /api/public/gold-prices (Navasan live when NAVASAN_API_KEY set, manual fallback from gold_prices table), PriceBoard + PriceTicker on homepage, admin "قیمت‌های طلا" tab
- [x] Live monitor removed from public site at user's request; automatic price connection no longer requested.
- [x] Restrict management to designated account in database permissions, block new registration, and add password recovery; account access and recovery-email request verified.
- [x] Add customer AI questions grounded in the currently looked-up gold piece; real answers verified for 10042 → 775, absent weight, and unavailable owner/prices/other codes on desktop and mobile; eight tests pass.
