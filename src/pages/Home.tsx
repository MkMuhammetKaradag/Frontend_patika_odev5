import { Box, Container } from "@mui/material";
import CoinTable from "../components/CoinTable";
import { useState } from "react";
import SearchInput from "../components/SearchInput";

const Home = () => {
  const [searchText, setSearchText] = useState("");
  return (
    <Container
      sx={{
        marginTop: 10,
      }}
    >
      <Box>
        <SearchInput
          searchText={searchText}
          setSearchText={setSearchText}
        ></SearchInput>
      </Box>
      <CoinTable searchText={searchText}></CoinTable>
    </Container>
  );
};

export default Home;
