const BackgroundImage = () => (
  <div className="fixed inset-0 z-0 pointer-events-none">
    <div className="absolute inset-0 bg-gradient-to-br from-green-900/10 to-blue-900/10" />
    <img
      src="/images/earth-bg.jpg"
      alt="Earth background"
      className="w-full h-full object-cover opacity-10"
    />
  </div>
);

export default BackgroundImage; 