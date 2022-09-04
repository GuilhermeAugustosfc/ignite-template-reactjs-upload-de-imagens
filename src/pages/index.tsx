import { Button, Box } from '@chakra-ui/react';
import { useMemo } from 'react';
import { useInfiniteQuery } from 'react-query';

import { Header } from '../components/Header';
import { CardList } from '../components/CardList';
import { api } from '../services/api';
import { Loading } from '../components/Loading';
import { Error } from '../components/Error';

interface Card {
  title: string;
  description: string;
  url: string;
  ts: number;
  id: string;
}

export default function Home(): JSX.Element {
  const {
    data,
    isLoading,
    isError,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery('images', fetchImages, {
    getNextPageParam: (lastPage, pages) => lastPage.after,
  });

  function fetchImages({ pageParam = null }) {
    return api
      .get('/api/images', {
        params: {
          after: pageParam,
        },
      })
      .then(res => res.data);
  }

  function onHandlerNextPage() {
    fetchNextPage();
  }

  const formattedData: Card[] = useMemo(() => {
    return data?.pages.flatMap(row => {
      return row.data;
    });
  }, [data]);

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return <Error />;
  }

  return (
    <>
      <Header />
      <Box maxW={1120} px={20} mx="auto" my={20}>
        <CardList cards={formattedData} />
        {isFetchingNextPage && <Loading />}
        {hasNextPage && (
          <Button onClick={onHandlerNextPage}>Carregar mais</Button>
        )}
      </Box>
    </>
  );
}
