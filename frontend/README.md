# MLMS Frontend

This is the frontend application for the Learning Management System (MLMS).

## Features

- User authentication (login/register)
- Role-based access control
- Profile management
- Leave request management
- User management (admin only)

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

## Development

To start the development server:

```bash
npm start
# or
yarn start
```

The application will be available at `http://localhost:3000`.

## Building for Production

To build the application for production:

```bash
npm run build
# or
yarn build
```

The build files will be created in the `build` directory.

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
REACT_APP_API_URL=http://localhost:3000
REACT_APP_CORS_ORIGIN=http://localhost:3000
```

For production, use `.env.production` with the appropriate values.

## Testing

To run tests:

```bash
npm test
# or
yarn test
```

## Deployment

The application can be deployed to any static hosting service. For example, to deploy to Render:

1. Create a new static site
2. Connect your GitHub repository
3. Set the build command to `npm run build` or `yarn build`
4. Set the publish directory to `build`
5. Add the environment variables
6. Deploy

## License

This project is licensed under the MIT License. 