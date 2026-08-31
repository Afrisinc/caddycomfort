# 🧪 Testing Checklist - Clementine Classic Shop

Use this checklist to verify all features are working correctly.

---

## ✅ Homepage Tests

### Hero Carousel

- [ ] Images slide automatically (5-second interval)
- [ ] Navigation dots work
- [ ] Previous/Next arrows function
- [ ] Carousel is responsive on mobile

### Sections

- [ ] Featured categories display correctly
- [ ] Featured products load
- [ ] Flash sale countdown works
- [ ] Newsletter form accepts email input

---

## ✅ Navigation Tests

### Desktop Navbar

- [ ] Logo links to homepage
- [ ] All navigation links work (Shop, Collections, New Arrivals, About)
- [ ] Search bar appears and accepts input
- [ ] Search suggestions dropdown works
- [ ] User icon links to account/login
- [ ] Wishlist icon links correctly
- [ ] Cart icon shows correct item count
- [ ] Cart count updates when items added/removed

### Mobile Navbar

- [ ] Hamburger menu opens sidebar
- [ ] Search bar works in mobile menu
- [ ] All navigation links accessible
- [ ] Sidebar closes after navigation

### Footer

- [ ] All shop category links work
- [ ] Help section links (Contact, Shipping, Returns, FAQ) work
- [ ] Privacy Policy link works
- [ ] Terms of Service link works
- [ ] Social media icons present
- [ ] Newsletter subscription form works

---

## ✅ Search Tests

### Search Bar

- [ ] Input accepts text
- [ ] Suggestions appear after 2 characters
- [ ] Debouncing works (300ms delay)
- [ ] Recent searches display
- [ ] Recent searches can be cleared
- [ ] Keyboard navigation works:
  - [ ] Arrow Down selects next suggestion
  - [ ] Arrow Up selects previous suggestion
  - [ ] Enter navigates to selected product
  - [ ] Escape closes dropdown
- [ ] Clicking outside closes dropdown

### Search Results Page (`/search?q=...`)

- [ ] Results display correctly
- [ ] "No results" message shows when applicable
- [ ] Price filter slider works
- [ ] Category checkboxes filter results
- [ ] Brand checkboxes filter results
- [ ] Sort dropdown works (Relevance, Newest, Price, Rating)
- [ ] Product cards link to detail pages
- [ ] Clear filters button resets all filters
- [ ] Mobile filter sheet works

---

## ✅ Shop & Products Tests

### Shop Page (`/shop`)

- [ ] Products display in grid
- [ ] Price filter slider adjusts range
- [ ] Size checkboxes filter products
- [ ] Color checkboxes filter products
- [ ] Brand checkboxes filter products
- [ ] Sort dropdown changes order
- [ ] Pagination works (if implemented)
- [ ] Mobile filter sheet accessible

### Product Detail Page (`/shop/[id]`)

- [ ] Main image displays
- [ ] Thumbnail gallery works
- [ ] Size selector functions
- [ ] Color selector functions
- [ ] Quantity controls work (+/-)
- [ ] Add to Cart button works
- [ ] Cart count in navbar updates
- [ ] Tabs switch (Description, Shipping, Reviews)
- [ ] Related products display
- [ ] Breadcrumb navigation works

---

## ✅ Cart Tests

### Cart Page (`/cart`)

- [ ] Cart items display with thumbnails
- [ ] Quantity can be increased
- [ ] Quantity can be decreased
- [ ] Remove item works
- [ ] Cart updates immediately
- [ ] Coupon code input accepts text
- [ ] "SAVE10" coupon applies 10% discount
- [ ] Invalid coupon shows error
- [ ] Subtotal calculates correctly
- [ ] Discount applies to total
- [ ] Shipping cost shown/free threshold displayed
- [ ] Total calculates correctly
- [ ] "Proceed to Checkout" button navigates
- [ ] Empty cart message displays when cart is empty
- [ ] "Continue Shopping" link works

---

## ✅ Checkout Tests

### Checkout Page (`/checkout`)

- [ ] Progress stepper shows current step
- [ ] Step 1: Shipping form displays
  - [ ] All fields accept input
  - [ ] Required fields validated
  - [ ] Email format validated
  - [ ] "Continue to Payment" advances
- [ ] Step 2: Payment methods display
  - [ ] Credit Card option selectable
  - [ ] Mobile Money option selectable
  - [ ] Cash on Delivery option selectable
  - [ ] Card form fields appear (if Credit Card)
  - [ ] "Review Order" button advances
- [ ] Step 3: Order review displays
  - [ ] Order items listed
  - [ ] Shipping address shown
  - [ ] Payment method shown
  - [ ] Total amount correct
  - [ ] "Place Order" button works

---

## ✅ Authentication Tests

### Login Page (`/login`)

- [ ] Login tab displays form
- [ ] Register tab displays form
- [ ] Email field accepts input
- [ ] Password field accepts input (hidden)
- [ ] "Sign In" button works
- [ ] "Sign Up" button works
- [ ] "Forgot password?" link visible
- [ ] Social login buttons visible (if implemented)
- [ ] Error messages display for invalid credentials
- [ ] Success redirects to account page

---

## ✅ Account Tests

### Account Dashboard (`/account`)

- [ ] Welcome message displays with username
- [ ] Stats cards show correct numbers
  - [ ] Total Orders
  - [ ] Total Spent
  - [ ] Loyalty Points
- [ ] Quick action buttons work
  - [ ] View Orders
  - [ ] Track Order
  - [ ] Update Profile
  - [ ] Contact Support
- [ ] Recent orders table displays
- [ ] Navigation tabs work (Profile, Orders, Wishlist)

### Profile Page (`/account/profile`)

- [ ] Form pre-filled with user data
- [ ] All fields editable
- [ ] "Save Changes" button works
- [ ] Success message displays
- [ ] Avatar upload works (if implemented)

### Orders Page (`/account/orders`)

- [ ] Order list displays
- [ ] Order cards show correct info
  - [ ] Order number
  - [ ] Date
  - [ ] Status
  - [ ] Items
  - [ ] Total
- [ ] "View Details" button works
- [ ] Filter by status works (if implemented)
- [ ] Empty state displays if no orders

### Wishlist Page (`/account/wishlist`)

- [ ] Wishlist items display
- [ ] Remove from wishlist works
- [ ] Add to cart from wishlist works
- [ ] Product links work
- [ ] Empty state displays if no items

---

## ✅ CMS Pages Tests

### About Page (`/about`)

- [ ] Brand story section displays
- [ ] Mission statement visible
- [ ] Values section displays
- [ ] Images load correctly
- [ ] All apostrophes display correctly (not &apos;)

### Contact Page (`/contact`)

- [ ] Contact form displays
- [ ] Name field accepts input
- [ ] Email field validates format
- [ ] Message textarea accepts input
- [ ] "Send Message" button works
- [ ] Success message displays
- [ ] Store locations display
- [ ] Business hours visible
- [ ] Contact information correct

---

## ✅ Legal Pages Tests (NEW)

### Shipping & Returns Page (`/shipping`)

- [ ] Page loads without errors
- [ ] Domestic shipping section displays
- [ ] International shipping section displays
- [ ] Processing times visible
- [ ] Return policy (30-day) displays
- [ ] Return process steps listed
- [ ] Exchange information visible
- [ ] Damaged items section displays
- [ ] Icons render correctly

### FAQ Page (`/faq`)

- [ ] Page loads without errors
- [ ] Accordion sections work
  - [ ] Orders & Payments section expands/collapses
  - [ ] Shipping & Delivery section expands/collapses
  - [ ] Returns & Exchanges section expands/collapses
  - [ ] Products & Sizing section expands/collapses
  - [ ] Account & Membership section expands/collapses
- [ ] All questions display
- [ ] All answers display
- [ ] Only one section open at a time

### Privacy Policy Page (`/privacy`)

- [ ] Page loads without errors
- [ ] All sections display
  - [ ] Data collection
  - [ ] Usage purposes
  - [ ] Security measures
  - [ ] Sharing policies
  - [ ] User rights
  - [ ] Cookies
  - [ ] Retention
  - [ ] Children's privacy
  - [ ] Contact information
- [ ] Content is readable
- [ ] Shield icon displays

### Terms & Conditions Page (`/terms`)

- [ ] Page loads without errors
- [ ] All sections display
  - [ ] Agreement to terms
  - [ ] Website use
  - [ ] Pricing & payment
  - [ ] Orders
  - [ ] Shipping
  - [ ] Returns
  - [ ] Intellectual property
  - [ ] User accounts
  - [ ] Liability
  - [ ] Warranties
  - [ ] Indemnification
  - [ ] Governing law
- [ ] Content is readable
- [ ] FileText icon displays

### 404 Not Found Page (`/not-found`)

- [ ] Custom 404 page displays
- [ ] "404" heading visible
- [ ] "Page Not Found" message displays
- [ ] "Go Home" button works
- [ ] "Browse Shop" button works
- [ ] Navbar and Footer present

---

## ✅ Responsive Design Tests

### Mobile (< 768px)

- [ ] Navigation collapses to hamburger menu
- [ ] Search bar works in mobile menu
- [ ] Product grids stack (1 column)
- [ ] Cart displays correctly
- [ ] Forms are usable
- [ ] Buttons are touch-friendly (44x44px minimum)
- [ ] Images scale properly
- [ ] Text is readable (minimum 16px)
- [ ] Filters open in sheet/modal

### Tablet (768px - 1024px)

- [ ] Navigation displays correctly
- [ ] Product grids show 2 columns
- [ ] Sidebar filters collapse to drawer
- [ ] Images scale appropriately
- [ ] Forms fit screen width

### Desktop (> 1024px)

- [ ] Full navigation bar displays
- [ ] Search bar in navbar
- [ ] Product grids show 3-4 columns
- [ ] Sidebar filters always visible
- [ ] Hover states work
- [ ] All content fits max-width container

---

## ✅ Performance Tests

### Loading Times

- [ ] Homepage loads in < 3 seconds
- [ ] Product pages load in < 2 seconds
- [ ] Search results appear in < 1 second
- [ ] Images lazy load
- [ ] No layout shift during page load

### Interactions

- [ ] Search debouncing prevents excessive requests
- [ ] Cart updates smoothly
- [ ] Page transitions are smooth
- [ ] No console errors
- [ ] No 404 errors for assets

---

## ✅ Browser Compatibility

### Chromium (Chrome, Edge)

- [ ] All features work
- [ ] Styling correct
- [ ] Animations smooth

### Firefox

- [ ] All features work
- [ ] Styling correct
- [ ] Animations smooth

### Safari

- [ ] All features work
- [ ] Styling correct
- [ ] Animations smooth

### Mobile Browsers

- [ ] iOS Safari works
- [ ] Android Chrome works
- [ ] Touch gestures supported

---

## ✅ Data Persistence

### LocalStorage

- [ ] Cart persists after page reload
- [ ] Recent searches persist
- [ ] Auth token persists (if logged in)
- [ ] Theme preference persists (if implemented)

### State Management

- [ ] Zustand cart store works
- [ ] Zustand auth store works
- [ ] State updates trigger re-renders
- [ ] No unnecessary re-renders

---

## ✅ Accessibility

### Keyboard Navigation

- [ ] Tab order is logical
- [ ] All interactive elements focusable
- [ ] Focus visible (outline/ring)
- [ ] Enter/Space activates buttons
- [ ] Arrow keys work in dropdowns

### Screen Readers

- [ ] Alt text on all images
- [ ] ARIA labels on buttons
- [ ] Form labels associated
- [ ] Error messages announced

### Visual

- [ ] Color contrast meets WCAG AA
- [ ] Text is resizable
- [ ] No content lost at 200% zoom
- [ ] Focus indicators visible

---

## ✅ SEO

### Meta Tags

- [ ] Title tags on all pages
- [ ] Meta descriptions on all pages
- [ ] Open Graph tags (if implemented)
- [ ] Canonical URLs set

### Content

- [ ] Semantic HTML (h1, h2, etc.)
- [ ] Descriptive link text
- [ ] Image alt attributes
- [ ] Proper heading hierarchy

---

## 🚨 Known Issues

**Document any issues found during testing:**

1. Issue: _____________________________
   - Expected: _____________________________
   - Actual: _____________________________
   - Steps to reproduce: _____________________________

2. Issue: _____________________________
   - Expected: _____________________________
   - Actual: _____________________________
   - Steps to reproduce: _____________________________

---

## 📝 Notes

**Additional observations or suggestions:**

---

**Tester**: _____________________________
**Date**: _____________________________
**Environment**: Development / Staging / Production
**Browser**: _____________________________
**Device**: _____________________________

---

## ✅ Sign-off

All critical tests passing:

- [ ] Homepage
- [ ] Shop & Products
- [ ] Cart & Checkout
- [ ] Search
- [ ] Account
- [ ] CMS & Legal Pages
- [ ] Responsive Design
- [ ] Performance

**Approved by**: _____________________________
**Date**: _____________________________

---

**Status**: 🚀 READY FOR PRODUCTION
