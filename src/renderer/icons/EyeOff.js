// @flow

import React from "react";

const path = (
  <path
    fill="currentColor"
    d="M2.502 8.393c.335.494.731.99 1.184 1.45 1.267 1.286 2.713 2.046 4.304 2.046a5.462 5.462 0 0 0 3.121-1.03c.257-.187.512-.072.708.172.195.244.256.525 0 .71A6.674 6.674 0 0 1 8 13c-1.972 0-3.698-.907-5.165-2.398a11.477 11.477 0 0 1-1.313-1.606 8.35 8.35 0 0 1-.46-.748.532.532 0 0 1 .007-.51 10.965 10.965 0 0 1 3.112-3.48.603.603 0 0 1 .818.105.538.538 0 0 1-.11.779 9.859 9.859 0 0 0-2.64 2.86c.074.12.158.251.253.391zm10.996-.786c-.335-.494-.731-.99-1.184-1.45-1.267-1.286-2.713-2.046-4.315-2.046-.368 0-.734.04-1.091.119a.585.585 0 0 1-.701-.414.555.555 0 0 1 .435-.668c.446-.1.902-.149 1.358-.148 1.972 0 3.698.907 5.165 2.398.504.512.942 1.059 1.313 1.606.225.33.378.591.46.748a.532.532 0 0 1-.007.51 10.821 10.821 0 0 1-1.328 1.868.604.604 0 0 1-.822.067.538.538 0 0 1-.07-.782c.39-.442.738-.916 1.04-1.416a9.37 9.37 0 0 0-.253-.392zm-4.426 2.29a2.225 2.225 0 0 1-3.38-1.306 2.221 2.221 0 0 1 .3-1.775L1.17 1.996a.583.583 0 1 1 .825-.825l12.833 12.833a.583.583 0 1 1-.825.825L9.072 9.896zm-2.26-2.26a1.11 1.11 0 0 0 1.44 1.44l-1.44-1.44z"
  />
);

const EyeOff = ({ size }: { size: number }) => (
  <svg viewBox="0 0 16 16" height={size} width={size}>
    {path}
  </svg>
);

export default EyeOff;