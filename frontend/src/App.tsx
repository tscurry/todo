import { Dashboard, Header, Todo } from './components';
import { NewTask } from './components/Buttons';
import { AuthHeader } from './components/Header';
import { GlobalLoadingOverlay } from './components/Overlay';

import { keepPreviousData, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ListProvider from './context/ListContext';

const queryClient = new QueryClient();

const App = () => {
  queryClient.setDefaultOptions({
    queries: {
      placeholderData: keepPreviousData,
    },
  });

  return (
    <ListProvider>
      <QueryClientProvider client={queryClient}>
        <div className="grid-container transition-all">
          <GlobalLoadingOverlay />
          <AuthHeader />
          <Header />
          <Dashboard />
          <Todo />
          <div className="create-task-button flex items-center">
            <NewTask />
          </div>
        </div>
      </QueryClientProvider>
    </ListProvider>
  );
};

export default App;
