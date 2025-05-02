const trash = () => {
  return (
    <div>
      {" "}
      <button
        onClick={() => alert("Trash button clicked")}
        type="button"
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Trash
      </button>
    </div>
  );
};

export default trash;
