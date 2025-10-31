# Project Overview

This is a Next.js project that builds a static microsite for "Papelería Notarial y Corporativa S.A. de C.V.". The site is built with TypeScript and React.

The content for the entire website is sourced from a single `db.json` file. This includes navigation links, page content, and contact information.

The project is configured to be exported as a static site and served from a subdirectory (`/not214c`), as indicated by the `basePath` and `output: 'export'` settings in `next.config.ts`.

# Building and Running

*   **Development:** To run the development server with Turbopack, use the following command:
    ```bash
    npm run dev
    ```

*   **Build:** To build the static site for production, use the following command:
    ```bash
    npm run build
    ```

*   **Start:** To start a production server, use the following command:
    ```bash
    npm run start
    ```

# Development Conventions

*   **Styling:** The project uses CSS Modules for styling, as seen in the `*.module.css` files.
*   **Components:** Reusable components are located in the `src/components` directory.
*   **Content:** All website content is managed in the `db.json` file. To change text, images, or links on the site, you should edit this file.
*   **Pages:** The application uses the Next.js App Router. Each page is a `page.tsx` file within a directory in `src/app`.
