# Render Configuration

## Web Service Settings

### Build Command:

```bash
npm run build
```

### Start Command:

```bash
npm start
```

### Environment Variables:

```
NODE_ENV=production
PORT=5000
```

## Important Notes

1. **Static Export**: The frontend is built as a static export and served by the Express backend
2. **API Routes**: All API routes are prefixed with `/api`
3. **Port**: The backend uses port 5000 by default (Render will set the PORT automatically)
4. **Build Process**: Builds both backend and frontend in sequence

## Deployment Steps on Render:

1. Create a new Web Service
2. Connect your GitHub repository
3. Set **Build Command**: `npm run build`
4. Set **Start Command**: `npm start`
5. Add environment variable: `NODE_ENV=production`
6. Deploy!

The app will be accessible at your Render URL with both frontend and API working together.
