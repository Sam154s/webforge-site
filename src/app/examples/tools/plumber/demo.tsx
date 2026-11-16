'use client'
// Tidewater Plumbing & Heating: one firm, two tools. The screen opens on a choice between them; each tool is its own
// five-stage journey with its own steps, so the journal shows what that tool automates.
import { useState } from 'react'
import { IBM_Plex_Sans_Condensed } from 'next/font/google'
import { FIRMS } from '@/lib/sandbox/journey'
import { PLUMBER_STEPS } from '@/lib/sandbox/steps/plumber'
import Stage, { FirmHead } from '../stage'
import FaultFinder from './fault'
import Planner from './planner'
import { ChoiceBoiler, ChoicePlan } from './choice'
import './plumber.css'

// One extra face for the firm: a condensed sans for drawing labels, as on a service manual plate.
const cond = IBM_Plex_Sans_Condensed({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--tw-cond' })
const home = { ...FIRMS.plumber, url: 'tidewater.example', line: 'One firm, two tools: a boiler fault finder for the call-out, and a heating planner for the job worth ten times as much.' }

export default function PlumberDemo() {
  const [tool, setTool] = useState<'fault' | 'plan' | null>(null)
  return (
    <div className={cond.variable}>
      {tool === 'fault' ? <FaultFinder onHome={() => setTool(null)} />
        : tool === 'plan' ? <Planner onHome={() => setTool(null)} />
        : (
          <Stage firm={home} steps={PLUMBER_STEPS} stage={0} artefacts={{}} onRestart={() => setTool(null)} next={{ href: '/#payoff', label: 'Work out your numbers' }}>
            <div className="tw">
              <FirmHead firm={home} right="Gas Safe registered" />
              <div className="col"><h2>What can we help with?</h2>
                <p className="lede">Both take a few minutes and neither needs a phone call. You see the answer, the price and the diary before you commit to anything.</p></div>
              <div className="tw-choice">
                <button type="button" onClick={() => setTool('fault')}>
                  <ChoiceBoiler />
                  <span className="txt"><strong>Something is wrong with my boiler</strong><span>Tell us the boiler and the code. Get the cause, the part, a fixed price and a visit timed for when the part arrives.</span><span className="go">Find the fault</span></span>
                </button>
                <button type="button" onClick={() => setTool('plan')}>
                  <ChoicePlan />
                  <span className="txt"><strong>Plan my heating</strong><span>Build your home room by room. Get a thermal plan, a radiator schedule, the right size of boiler and a priced data sheet.</span><span className="go">Start the plan</span></span>
                </button>
              </div>
              <p className="tw-safe">Smell gas? Leave the house and call <b>0800 111 999</b>. Tidewater is a fictional firm. Catalogue, rules and prices are examples.</p>
            </div>
          </Stage>
        )}
    </div>
  )
}
