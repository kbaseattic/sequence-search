import { useEffect, useState } from 'react';
import { notification } from 'antd';
import { useLocalStorage } from '@rehooks/local-storage';
import { Search } from '../types/Search';
import { Namespace } from '../types/Namespace';

export function useSearch() {
  const [searchIds, setSearchIds] = useLocalStorage<Search['ticketId'][]>('searchIds', []);
  const [searchStatus, setSearchStatus] = useState<Record<Search['ticketId'], Search['status']>>({});
  const [searchResults, setSearchResults] = useState<Record<Search['ticketId'], Search['result']>>({});

  // Used to detect when searches have changed state.
  const searchSentinal = JSON.stringify(searchIds.map(id => [id, searchStatus[id]]));

  // Poll for search status changes
  useEffect(() => {
    if (searchIds.every(id => searchStatus[id] === "completed")) return;
    pollStatus();
    const poll = setInterval(pollStatus, 3000);
    return () => clearInterval(poll);
  }, [searchSentinal]);

  async function pollStatus() {
    try {
      const response = await fetch("/api/search_status", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(searchIds)
      });
      if (response.ok) {
        const newStatus = await response.json();
        const needsUpdate = searchIds.some(id => newStatus[id] !== searchStatus[id]);
        if (needsUpdate) {
          setSearchStatus(newStatus)
        }
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

  // Used to detect which results need to be loaded
  const missingResults = searchIds.filter(id => searchStatus[id] === "completed" && searchResults[id] === undefined);

  // Fetch results for completed searches, loads one at a time
  useEffect(() => {
    if (missingResults.length === 0) return;
    const id = missingResults[missingResults.length - 1];
    fetchResult(id);
  }, [JSON.stringify(missingResults)]);

  async function fetchResult(id: Search['ticketId']) {
    try {
      const response = await fetch(`/api/search_result?id=${id}`);
      if (response.ok) {
        var result = await response.json()
        setSearchResults({
          ...searchResults,
          [id]: result
        })
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

  async function newSearch(namespace: Namespace['id'], sequence: string) {
    try {
      const response = await fetch("/api/search", {
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