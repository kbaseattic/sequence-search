import { useEffect, useState } from 'react';
import { notification } from 'antd';
import { useLocalStorage } from '@rehooks/local-storage';
import { Search } from '../types/Search';
import { Namespace } from '../types/Namespace';
import { usePrevious } from './usePrevious';
import { urlFor } from '../utils/urlFor';
import { parseFASTA } from '../utils/handleFASTA';

async function fetchStatuses() {
  try {
    const response = await fetch(urlFor("/api/v1/jobs"));
    if (response.ok) {
      const searchStatus: Record<Search['id'], Search> = await response.json();
      const newStatuses: Record<Search['id'], Search['status']> = {};
      for (const id in searchStatus) {
        newStatuses[id] = searchStatus[id].status
      }
      return newStatuses
    } else {
      throw new Error(`Failed to poll search status, received ${response.status}: ${response.statusText}`);
    }
  } catch (err) {
    notification.open({
      message: 'Failed to poll search status',
      description: (err instanceof Error) ? err.message : JSON.stringify(err),
      type: 'error'
    });
  }
}

async function fetchResult(id: Search['id']) {
  try {
    const response = await fetch(urlFor(`/api/v1/jobs/${id}`));
    if (response.ok) {
      const result: Search['result'] = await response.json();
      return result
    } else {
      throw new Error(`Failed to retrieve search result for ${id}, received ${response.status}: ${response.statusText}`);
    }
  } catch (err) {
    notification.open({
      message: 'Failed to retrieve search result',
      description: (err instanceof Error) ? err.message : JSON.stringify(err),
      type: 'error'
    });
  }
}

export function useSearch() {
  const [searchIds, setSearchIds] = useLocalStorage<Search['id'][]>('searchIds', []);
  const [searchStatus, setSearchStatus] = useState<Record<Search['id'], Search['status']>>({});
  const [searchResults, setSearchResults] = useState<Record<Search['id'], Search['result']>>({});

  // Poll for search status changes
  const shouldPoll = searchIds.some(id => searchStatus[id] !== "completed");
  useEffect(() => {
    if (!shouldPoll) return;

    const poll = async () => {
      const next = await fetchStatuses();
      setSearchStatus(prev => ({ ...prev, ...next }))
    };

    poll();
    const pollInterval = setInterval(poll, 3000);
    return () => clearInterval(pollInterval);

  }, [searchIds, shouldPoll]);

  // Fetch results for newly completed searches
  const completed = searchIds.filter(id => searchStatus[id] === "completed");
  const prevCompleted = usePrevious(completed) || [];
  const newlyCompleted = completed.filter(id => !prevCompleted.includes(id));
  useEffect(() => {
    newlyCompleted.forEach(async id => {
      const result = await fetchResult(id);
      setSearchResults(prev => ({
        ...prev,
        [id]: result
      }))
    })
  }, [newlyCompleted]);

  async function newSearch(namespace: Namespace['id'], fasta: string, eVal: number) {
    try {
      const response = await fetch(urlFor(`/api/v1/namespaces/${namespace}/jobs`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sequences: await parseFASTA(fasta)
        })
      });
      if (response.ok) {
        const search: Search = await response.json();
        addSearchById(search.id, search.status);
      } else {
        throw new Error(`Failed to submit search, received ${response.status}: ${response.statusText}`);
      }
    } catch (err) {
      notification.open({
        message: 'Failed to submit search',
        description: (err instanceof Error) ? err.message : JSON.stringify(err),
        type: 'error'
      });
    }
  }

  function addSearchById(id: Search['id'], status: Search['status'] = undefined) {
    setSearchIds([id, ...searchIds])
    setSearchStatus(prev => ({ ...prev, id: status }))
  }

  function clearSearches() {
    setSearchIds([]);
  }

  const searches: Search[] = searchIds.map(id => ({
    id: id,
    status: searchStatus[id],
    result: searchResults[id]
  }))

  console.log({ searches, newSearch, addSearchById, clearSearches })

  return { searches, newSearch, addSearchById, clearSearches }
}