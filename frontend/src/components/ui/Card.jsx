export default function Card({ children, className = "" }) {
  return (
    <div className={"bg-gray-800 border border-gray-700 rounded-xl p-4 " + className}>
      {children}
    </div>
  );
}
