import { useEffect, useState } from 'react';
import { notification } from 'antd';
import { useLocalStorage } from '@rehooks/local-storage';
import { Search } from '../types/Search';
import { Namespace } from '../types/Namespace';
import { usePrevious } from './usePrevious';
import { urlFor } from '../utils/urlFor';

async function fetchStatus(searchIds: Search['ticketId'][]) {
  try {
    const response = await fetch(urlFor("/api/search_status"), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(searchIds)
    });
    if (response.ok) {
      const newStatus = await response.json();
      return newStatus as Record<Search['ticketId'], Search['status']>
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

async function fetchResult(id: Search['ticketId']) {
  try {
    const response = await fetch(urlFor(`/api/search_result?id=${id}`));
    if (response.ok) {
      const result = await response.json();
      return result as Search['result']
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
  const [searchIds, setSearchIds] = useLocalStorage<Search['ticketId'][]>('searchIds', []);
  const [searchStatus, setSearchStatus] = useState<Record<Search['ticketId'], Search['status']>>({});
  const [searchResults, setSearchResults] = useState<Record<Search['ticketId'], Search['result']>>({});

  // Poll for search status changes
  const shouldPoll = searchIds.some(id => searchStatus[id] !== "completed");
  useEffect(() => {
    if (!shouldPoll) return;

    const poll = async () => {
      const next = await fetchStatus(searchIds);
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

  async function newSearch(namespace: Namespace['id'], sequence: string) {
    try {
      const response = await fetch(urlFor("/api/search"), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ namespace, sequence })
      });
      if (response.ok) {
        const ticketId = (await response.json()).toString();
        addSearchById(ticketId)
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

  function addSearchById(id: Search['ticketId']) {
    setSearchIds([id, ...searchIds])
  }

  function clearSearches() {
    setSearchIds([]);
  }

  const searches: Search[] = searchIds.map(id => ({
    ticketId: id,
    status: searchStatus[id],
    result: searchResults[id]
  }))

  return { searches, newSearch, addSearchById, clearSearches }
}