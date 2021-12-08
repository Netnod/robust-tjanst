import Image from 'next/image'
import React from 'react'
import logo from '../assets/robust_logotype.png'
const Header = () => {
  return (
    <div className="w-full flex items-center flex-col mt-12">
      <div className="pt-8 flex flex-col">
        <div className="mx-4 md:mx-0 flex mb-8 justify-center w-11/12 md:w-3/4 self-center">
          <Image
            src={logo}
            alt="Robust Tjänst av Netnod"
            className="mt-12 md:mt-64"
          />
        </div>
        {/* <p>Testa din sida för att säkra en robust tjänst</p> */}

        <div className="px-4 my-12 flex flex-col items-center justify-center flex-grow">
          <form className="w-full w-full lg:w-3/4 flex flex-row">
            <input
              className="flex-grow p-4"
              autoFocus
              type="text"
              name="url"
              placeholder="http://din.sida.se"
            />
            <input
              type="submit"
              className="ml-2 w-24 btn bg-yellow"
              value="Testa"
            />
          </form>
          <p className="mt-4">
            Håller <em>din</em> sida måttet?
          </p>
        </div>
      </div>
    </div>
  )
}

export default Header
