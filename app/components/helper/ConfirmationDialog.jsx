const ConfirmationDialog = ({
  transaction,
  onConfirm,
  onCancel,
  passwordValue,
  setPasswordValue,
}) => {
  if (!transaction) return null;
  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-zinc-950/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-950 rounded-[2rem] border border-red-500/20 shadow-2xl p-8 w-full max-w-sm">
        <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center mb-6 text-red-500">
          <FiTrash2 size={24} />
        </div>

        <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tight mb-2">
          Delete Transaction?
        </h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6 leading-relaxed">
          You are about to remove the record for{" "}
          <span className="text-zinc-900 dark:text-zinc-100 font-bold">
            {transaction.serviceName}
          </span>
          . Please enter the security password to confirm.
        </p>

        {/* Security Password Input */}
        <div className="mb-6">
          <input
            type="password"
            placeholder="Security Password"
            value={passwordValue}
            onChange={(e) => setPasswordValue(e.target.value)}
            className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all uppercase tracking-widest placeholder:normal-case placeholder:tracking-normal"
          />
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={onConfirm}
            disabled={!passwordValue}
            className="w-full py-3 bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-black uppercase text-[10px] tracking-widest transition-all active:scale-95"
          >
            Confirm Deletion
          </button>
          <button
            onClick={onCancel}
            className="w-full py-3 bg-zinc-100 dark:bg-zinc-900 text-zinc-500 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
