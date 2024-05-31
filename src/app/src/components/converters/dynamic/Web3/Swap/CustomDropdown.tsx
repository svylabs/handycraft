import React, { useState } from 'react';

interface Token {
  address: string;
  symbol: string;
  logoURI: string;
}

interface CustomDropdownProps {
  tokens: Token[];
  selectedToken: Token | null;
  onSelect: (token: Token) => void;
  blurToken?: Token | null;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({ tokens, selectedToken, onSelect, blurToken }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSelect = (token: Token) => {
    onSelect(token);
    setIsOpen(false);
    setSearchQuery('');
  };

  const filteredTokens = tokens.filter(token =>
    token.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative">
      <button
        type="button"
        className="block w-full mt-1 border rounded py-2 px-3 bg-white text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedToken ? (
          <div className="flex items-center">
            <img src={selectedToken.logoURI} alt={selectedToken.symbol} className="w-6 h-6 mr-2" />
            {selectedToken.symbol}
          </div>
        ) : (
          'Select a token'
        )}
      </button>
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full h-60 overflow-scroll bg-white border rounded shadow-lg">
          <input
            type="text"
            className="w-full p-2 border-b"
            placeholder="Search token"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {filteredTokens.map((token) => (
            <div
              key={token.address}
              className={`flex items-center p-2 cursor-pointer hover:bg-gray-100 ${blurToken && token.address === blurToken.address ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => !blurToken || token.address !== blurToken.address ? handleSelect(token) : null}
            >
              <img src={token.logoURI} alt={token.symbol} className="w-6 h-6 mr-2" />
              {token.symbol}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;
