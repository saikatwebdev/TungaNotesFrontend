import React from 'react';

const NotesCard = ({ heading, explanation, onDelete }) => {
  return (
    <div className="h-60 w-55 bg-cover bg-[url('https://static.vecteezy.com/system/resources/previews/010/793/873/non_2x/a-lined-note-paper-covered-with-transparent-tape-on-a-yellow-background-with-a-white-checkered-pattern-free-png.png')] rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-4 cursor-pointer hover:-translate-y-1">

      <h2 className="text-xl font-semibold text-gray-800 text-center mt-2 truncate">
        {heading}
      </h2>
      <div className="h-[2px] w-16 bg-indigo-400 mx-auto mb-3 rounded"></div>
      <p className="text-gray-600 text-sm leading-relaxed overflow-y-auto max-h-32 px-1 scrollbar-hide">
        {explanation}
      </p>
      <button  
        onClick={onDelete} 
        className="mt-3 bg-red-600 hover:bg-red-700 text-white px-4 py-1 font-semibold rounded-full w-full transition-all duration-200 cursor-pointer"
      >
        Delete
      </button>
    </div>
  );
};

export default NotesCard;
