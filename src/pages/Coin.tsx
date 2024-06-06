import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { Container } from "@mui/material";
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);
export const options = {
  responsive: true,
  plugins: {
    legend: {
      position: "top" as const,
    },
    title: {
      display: true,
      text: "Line Chart",
    },
  },
};

const Coin = () => {
  const { id } = useParams<{ id: string }>();
  const [getCoinData, setGetCoinData] = useState<[number[]]>([[]]);
  const visibleData = React.useMemo(() => {
    return {
      labels: getCoinData.map((item) =>
        new Date(item[0]).toLocaleDateString("tr-TR")
      ),
      datasets: [
        {
          label: id,
          data: getCoinData.map((item) => item[1]),
          borderColor: "rgb(255, 99, 132)",
          backgroundColor: "rgba(255, 99, 132, 0.5)",
        },
      ],
    };
  }, [getCoinData, id]);

  useEffect(() => {
    axios
      .get<{
        prices: [number[]];
      }>(
        `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=365&precision=2
        }`,
        {
          headers: {
            accept: "application/json",
            "x-cg-demo-api-key": import.meta.env.VITE_APP_API_KEY as string,
          },
        }
      )
      .then((response) => {
        if (response.data) {
          console.log(response.data.prices[0]);
          setGetCoinData(response.data.prices);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  return (
    <Container>
      <Line options={options} data={visibleData} />
    </Container>
  );
};

export default Coin;
