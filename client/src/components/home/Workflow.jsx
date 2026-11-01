import React from 'react';

const workflowSteps = [
  {
    step: '01',
    phase: 'INITIALIZATION',
    title: 'Open cashier shift & declare cash float',
    description:
      'The cashier selects their profile at the Register Desk, enters their 6-digit PIN, and inputs the verified starting drawer float. Without an open shift, transactions are locked.',
    checkpoint: 'Shift ID immutably stored in session context',
  },
  {
    step: '02',
    phase: 'COUNTER TRANSACTION',
    title: 'Scan items & apply authorized discounts',
    description:
      'Products are buffered instantly via barcode reader or catalog search. Line item quantities adjust on screen. Discounts require verified supervisor credentials and cannot stack.',
    checkpoint: 'Real-time integer-cent price calculation',
  },
  {
    step: '03',
    phase: 'TENDER SETTLEMENT',
    title: 'Record payment & deduct atomic stock',
    description:
      'Tender is accepted via Cash, GCash/Maya with digital reference code, or Customer Credit. Sale completion and stock decrement execute within a single atomic MongoDB transaction.',
    checkpoint: 'Zero duplicate stock deductions via idempotency key',
  },
  {
    step: '04',
    phase: 'RECONCILIATION',
    title: 'Generate receipt & close shift with variance audit',
    description:
      'A thermal slip is issued immediately. At shift end, the cashier records final physical cash in the drawer. The system computes exact overage/shortage variance for manager sign-off.',
    checkpoint: 'X/Z reading logged to central immutable audit ledger',
  },
];

const Workflow = () => {
  return (
    <section id="how-it-works" className="bg-[#FFFFFF] py-16 sm:py-24 lg:py-28 border-b border-[#D0D0C7]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-10 border-b border-[#D0D0C7]">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#A14E38] bg-[#F0E4DD] px-2.5 py-0.5 rounded border border-[#D0D0C7]">
                05 / OPERATIONAL LIFECYCLE
              </span>
              <span className="h-px w-10 bg-[#D0D0C7]" />
              <span className="font-mono text-[10px] text-[#656960] uppercase">
                REGISTER DISCIPLINE
              </span>
            </div>
            <h2 className="font-serif sm:font-sans text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#242824] leading-[1.1]">
              How SUELTO POS works.
            </h2>
            <p className="text-sm sm:text-base text-[#656960] leading-relaxed">
              Four disciplined steps from opening the register drawer to final day-end cash reconciliation.
            </p>
          </div>

          <div className="font-mono text-xs text-[#656960]">
            STANDARD OPERATING PROCEDURE
          </div>
        </div>

        {/* Clean Editorial Numbered Timeline (Zero Gradients, Pure Flat Architecture) */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {workflowSteps.map((item) => (
            <div
              key={item.step}
              className="p-6 border border-[#D0D0C7] bg-[#F2F0E9] rounded flex flex-col justify-between space-y-6"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-serif text-3xl font-bold text-[#242824]">
                    {item.step}
                  </span>
                  <span className="font-mono text-[9px] uppercase font-bold tracking-widest text-[#A14E38] bg-[#FFFFFF] px-2 py-0.5 rounded border border-[#D0D0C7]">
                    {item.phase}
                  </span>
                </div>

                <h3 className="font-sans text-sm font-bold text-[#242824] leading-snug">
                  {item.title}
                </h3>

                <p className="text-xs text-[#656960] leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="pt-3 border-t border-[#D0D0C7] font-mono text-[10px] text-[#656960]">
                <span className="text-[#242824] font-bold block uppercase tracking-wider text-[9px] mb-0.5">
                  Audit Checkpoint
                </span>
                <span>{item.checkpoint}</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Workflow;
