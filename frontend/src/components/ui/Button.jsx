export default function Button({ children, onClick, className = "" }) {
  return (
    <button
      onClick={onClick}
      className={
        "px-4 py-2 rounded-md bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow " +
        className
      }
    >
      {children}
    </button>
  );
}
