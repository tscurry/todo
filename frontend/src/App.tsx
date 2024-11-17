import { Dashboard, Header, Todo } from './components';
import { NewTask } from './components/Buttons';
import { AuthHeader } from './components/Header';
import { GlobalLoadingOverlay } from './components/Overlay';
import { AuthProvider, LoadingProvider } from './context';
import ListProvider from './context/ListContext';
import TodoProvider from './context/TodoContext';

const App = () => {
  return (
    <AuthProvider>
      <ListProvider>
        <TodoProvider>
          <LoadingProvider>
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
          </LoadingProvider>
        </TodoProvider>
      </ListProvider>
    </AuthProvider>
  );
};

export default App;
