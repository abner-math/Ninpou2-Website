import React, { useState, useEffect } from "react";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import ReactPaginate from "react-paginate";
import "react-tabs/style/react-tabs.css";
import "./App.css";
import { Game } from "../../server/src/entities/game";

function App() {
  function Games({ currentGames }: { currentGames: Game[] }) {
    return (
      <>
        {currentGames &&
          currentGames.map((game: Game) => (
            <div>
              <h3>Game #{game.id}</h3>
            </div>
          ))}
      </>
    );
  }

  function PaginatedGames({ gamesPerPage }: { gamesPerPage: number }) {
    const [currentGames, setCurrentGames] = useState([]);
    const [gamesCount, setGamesCount] = useState(0);
    const [gamesOffset, setGamesOffset] = useState(0);
    useEffect(() => {
      fetch(`/games?take=${gamesPerPage}&skip=${gamesOffset}`)
        .then((res) => res.json())
        .then((data) => {
          setCurrentGames(data.games);
          setGamesCount(data.count);
        });
    });
    const handlePageClick = (event: { selected: number }) => {
      setGamesOffset(event.selected * gamesPerPage);
    };
    return (
      <>
        <Games currentGames={currentGames} />
        <ReactPaginate
          breakLabel="..."
          nextLabel="next >"
          onPageChange={handlePageClick}
          pageRangeDisplayed={5}
          pageCount={Math.ceil(gamesCount / gamesPerPage)}
          previousLabel="< previous"
          renderOnZeroPageCount={null}
          pageClassName="page-item"
          pageLinkClassName="page-link"
          previousClassName="page-item"
          previousLinkClassName="page-link"
          nextClassName="page-item"
          nextLinkClassName="page-link"
          breakClassName="page-item"
          breakLinkClassName="page-link"
          containerClassName="pagination"
          activeClassName="active"
        />
      </>
    );
  }

  return (
    <>
      <Tabs defaultIndex={0}>
        <TabList>
          <Tab>Games</Tab>
          <Tab>Players</Tab>
          <Tab>Heroes</Tab>
        </TabList>
        <TabPanel>
          <PaginatedGames gamesPerPage={2} />,
        </TabPanel>
        <TabPanel>
        </TabPanel>
        <TabPanel>
        </TabPanel>
      </Tabs>
    </>
  );
}

export default App