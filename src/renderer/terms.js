// @flow
import { useEffect, useState } from "react";

import network from "~/network";

const rawURL = "https://raw.githubusercontent.com/LedgerHQ/ledger-live-desktop/master/TERMS.md";
export const url = "https://github.com/LedgerHQ/ledger-live-desktop/blob/master/TERMS.md";

const currentTermsRequired = "2019-12-04";

export function isAcceptedTerms() {
  return global.localStorage.getItem("acceptedTermsVersion") === currentTermsRequired;
}

export function acceptTerms() {
  return global.localStorage.setItem("acceptedTermsVersion", currentTermsRequired);
}

export async function load() {
  const { data } = await network(rawURL);
  return data;
}

export const useTerms = () => {
  const [terms, setTerms] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    load().then(setTerms, setError);
  }, []);

  return [terms, error];
};
