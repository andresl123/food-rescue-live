export default function App() {
  return (
    <>
      {/* Tailwind CSS CDN is assumed to be loaded in the host environment */}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
          /* FIX: Ensure HTML and the React root element have full height */
          html, body, #root {
            height: 100%;
          }
          body {
            font-family: 'Inter', sans-serif;
            background-color: #f9fafb;
          }
        `}
      </style>
      <AppRouter />
    </>
  );
}
