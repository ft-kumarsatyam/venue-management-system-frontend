const AddVenueTabs = ({
  activeTab,
  setActiveTab,
}: {
  activeTab: string;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
}) => (
  <div className="flex justify-center mb-6">
    <span className="p-2 rounded-full bg-[var(--purple-bg-shadow)]">
      <button
        className={`px-6 py-2 rounded-full cursor-pointer ${
          activeTab === "polygon"
            ? "bg-gradient-to-r from-[var(--purple-dark-1)] to-[var(--purple-dark-2)] text-[var(--white)]"
            : "bg-purple-100 text-purple-700"
        }`}
        onClick={() => setActiveTab("polygon")}
      >
        Polygon
      </button>
      <button
        className={`px-6 py-2 rounded-full cursor-pointer ${
          activeTab === "radius"
            ? "bg-gradient-to-r from-[var(--purple-dark-1)] to-[var(--purple-dark-2)] text-white"
            : "bg-purple-100 text-purple-700"
        }`}
        onClick={() => setActiveTab("radius")}
      >
        Radius
      </button>
    </span>
  </div>
);

export default AddVenueTabs;