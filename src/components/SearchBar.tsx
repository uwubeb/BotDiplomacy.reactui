import React from 'react';

interface Props {
  onFormSubmit: (term: string) => void;
}

export const SearchBar: React.FC<Props> = (props) => {
  const [term, setTerm] = React.useState('');

  const onInputChange = (event: any) => {
    setTerm(event.target.value);
  };

  const onFormSubmit = (event: any) => {
    event.preventDefault();
    props.onFormSubmit(term);
  };

  return (
    <div className="search-bar ui segment">
      <form onSubmit={onFormSubmit} className="ui form">
        <div className="field">
          <label>Session ID</label>
          <input type="text" value={term} onChange={onInputChange} />
        </div>
      </form>
    </div>
  );
};
