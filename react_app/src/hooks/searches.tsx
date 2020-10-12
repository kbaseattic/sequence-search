import { useEffect, useState } from 'react';
import { notification } from 'antd';
import createPersistedState from 'use-persisted-state';
import { Search } from '../types/Search';

const useSearchState = createPersistedState('search')


export function useSearch() {
  const [searches, setSearches] = useSearchState([]) as [Search[], Function];

  const pendingSearchIds = searches
    .filter(search => search.status !== "completed")
    .map(search => search.ticketId)
    .filter((v, i, a) => a.indexOf(v) === i)
    .sort();

  // Used to detect when searches have changed state.
  const searchStatusSentinal = JSON.stringify(pendingSearchIds);

  async function newSearch(namespace: string, sequence: string) {
    try {
      const response = await fetch("/api/search", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ namespace, sequence })
      });
      if (response.ok) {
        const search: Search = {
          ticketId: (await response.json()).toString()
        };
        setSearches([search, ...searches])
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

  function addSearchById(ticketId: string) {
    const search: Search = { ticketId };
    setSearches([search, ...searches])
  }

  function clearSearches() {
    setSearches([])
  }

  async function pollStatus() {
    try {
      const response = await fetch("/api/search_status", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(pendingSearchIds)
      });
      if (response.ok) {
        const status = await response.json();
        const needsUpdate = searches.some(search => status[search.ticketId] && search.status !== status[search.ticketId]);
        if (needsUpdate) {
          setSearches(
            searches.map(search => ({
              ticketId: search.ticketId,
              status: status[search.ticketId] || search.status,
              result: search.result
            }))
          )
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

  async function fetchResult(id: string) {
    const index = searches.findIndex(search => search.ticketId === id);
    const search = searches[index];
    if (index == -1) return;

    const response = await fetch(`/api/search_result?id=${search.ticketId}`);
    const updated = {
      ticketId: search.ticketId,
      status: search.status,
      result: await response.json()
    }

    setSearches([
      ...searches.slice(0, index),
      updated,
      ...searches.slice(index + 1)
    ])
  }

  // Poll for search status changes
  useEffect(() => {
    if (searches.every(search => search.status === "completed")) return;
    pollStatus();
    const poll = setInterval(pollStatus, 3000);
    return () => clearInterval(poll);
  }, [searchStatusSentinal]);

  // Fetch results for completed searches, loads one at a time
  useEffect(() => {
    const missingResults = searches.filter(search => search.status === "completed" && search.result === undefined);
    const search = missingResults.pop();
    if (search !== undefined) {
      fetchResult(search.ticketId);
    }
  }, [searches]);

  return { searches, newSearch, addSearchById, clearSearches }
}