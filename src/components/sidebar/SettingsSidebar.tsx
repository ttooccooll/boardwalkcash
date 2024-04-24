import { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { Button, Sidebar } from 'flowbite-react';
import MintSidebarItem from './MintSidebarItem';
import AddMintButton from './AddMintButton';

const SettingsCog = () => (
   <svg
      xmlns='http://www.w3.org/2000/svg'
      fill='none'
      viewBox='0 0 24 24'
      strokeWidth={1.2}
      stroke='currentColor'
      className='w-6 h-6'
   >
      <path
         strokeLinecap='round'
         strokeLinejoin='round'
         d='M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z'
      />
      <path strokeLinecap='round' strokeLinejoin='round' d='M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z' />
   </svg>
);

const XMark = () => (
   <svg
      xmlns='http://www.w3.org/2000/svg'
      fill='none'
      viewBox='0 0 24 24'
      strokeWidth={1.5}
      stroke='black'
      className='w-6 h-6'
   >
      <path strokeLinecap='round' strokeLinejoin='round' d='M6 18 18 6M6 6l12 12' />
   </svg>
);

export const SettingsSidebar = () => {
   const [hidden, sethidden] = useState(true);
   const keysets = useSelector((state: RootState) => state.wallet.keysets);

   return (
      <>
         <div className={`${hidden ? '' : hidden}`}>
            <button className='fixed right-0 top-0 m-4 p-2 z-10' onClick={() => sethidden(!hidden)}>
               {hidden && <SettingsCog />}
            </button>
         </div>
         <Sidebar
            aria-label='Settings Sidebar'
            className={`fixed right-0 top-0 h-full min-w-96 bg-gray-100 shadow-lg z-10 ${hidden ? 'hidden' : ''}`}
         >
            <Sidebar.Items>
               <button className='hover:cursor-pointer' onClick={() => sethidden(true)}>
                  <XMark />
               </button>
               <Sidebar.ItemGroup>
                  <Sidebar.Collapse open={true} label='Mints'>
                     {Object.keys(keysets).map((id, idx) => (
                        <MintSidebarItem keyset={keysets[id]} key={idx} />
                     ))}
                  </Sidebar.Collapse>
               </Sidebar.ItemGroup>
               <Sidebar.ItemGroup>
                  <AddMintButton keysets={keysets} />
               </Sidebar.ItemGroup>
            </Sidebar.Items>
         </Sidebar>
      </>
   );
};

export default SettingsSidebar;