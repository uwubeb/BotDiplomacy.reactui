import React from 'react';
import apollo from '../apis/apollo';
import { SearchBar } from './SearchBar';
import '../style/App.css';
import GameField from './GameField';
import { GameSession } from '../models/GameSession.js';

export const App = () => {
  const [session, setSession] = React.useState({} as GameSession);
  const [error, setError] = React.useState('');

  const onFormSubmit = async (term: string) => {
    // validate regex
    let isGuid =
      /[({]?[a-fA-F0-9]{8}[-]?([a-fA-F0-9]{4}[-]?){3}[a-fA-F0-9]{12}[})]?/.test(
        term
      );
    if (!isGuid) {
      setError('Enter a valid GUID');
      return;
    }
    const response = await apollo.get('/GameSession/' + term).catch((error) => {
      setError(error.response.data.message);
    });
    if (response === undefined) return;
    setSession(response.data);
    setError('');
  };

  return (
    <div className="ui container">
      <SearchBar onFormSubmit={onFormSubmit} />
      <div className="error">{error !== '' ? error : null}</div>
      <GameField session={session} />
    </div>
  );
};

export default App;
