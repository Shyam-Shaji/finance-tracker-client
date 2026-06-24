import {QueryClient,QueryClientProvider} from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import {Toaster} from 'sonner';
import { ProtectedRoute } from './features/auth/ProtectedRoute';
import Login from './features/auth/Login';
import Dashboard from './features/dashboard/Dashboard';
import Settings from './features/dashboard/Settings';
import NotFound from './features/dashboard/NotFound';
const queryClient = new QueryClient({
  defaultOptions: {queries: {retry: 2, staleTime: 1000 * 60 * 5}},
});

function App() {

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
      <Routes>
        <Route path='/login' element={<Login/>}/>
        <Route element={<ProtectedRoute/>}>
        <Route path='/dashboard' element={<Dashboard/>}/>
        <Route path='/settings' element={<Settings/>}/>
        </Route>
        <Route path='*' element={<NotFound/>}/>
      </Routes>
      </BrowserRouter>
        <Toaster position='top-right' richColors/>
    </QueryClientProvider>
      
  )
}

export default App;
