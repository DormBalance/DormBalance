import Link from "next/link";

type ExpenseRow = {
    id: number;
    description: string;
    paidBy: string;
    date: string;
    total: string;
    status: string;
};

type RecentExpensesCardProps = {
    rows: ExpenseRow[];
    viewAll?: boolean;
    scrollable?: boolean;
    maxRows?: number;
}

//this function was made with chat gpt
function determineStatusClass(status: string): string{
    if (status.startsWith("You owe")){
        return "status-owe";
    } else if (status.includes("owes you")){
        return "status-owed";
    }
    return "status-settled";
}

export default function RecentExpensesCard({rows, viewAll = true, scrollable = false, maxRows = 5, }: RecentExpensesCardProps){
   
    const visibleRows = maxRows === Infinity ? rows : rows.slice(0,maxRows);

    return (
        <section className = "recent-expenses-card">
            <div className = "recent-expenses-header">
                <h2 className = "recent-expenses-title">Recent Expenses</h2> 
            </div>

            <div className = "recent-expenses-table">
                <div className = "recent-expenses-row recent-expenses-row-header">
                    <span>Description</span>
                    <span>Paid By</span>
                    <span>Date</span>
                    <span>Total</span>
                    <span>Status</span>
                </div>

                <div style={scrollable ? {maxHeight: "520px", overflowY: "auto"} : {}}> {/*lines 48 to 51 where autofilled with copilot and adjusted to fit look desires*/}
                    {visibleRows.length === 0 ?(
                        <div style={{padding: "40px", textAlign: "center", color: "#aaa", fontSize: "14px"}}> No Expenses </div>
                    ): (

                visibleRows.map((row) => (
                    <div className = "recent-expenses-row" key = {row.id}>
                        <span>{row.description}</span>
                        <span>{row.paidBy}</span>
                        <span>{row.date}</span>
                        <span>{row.total}</span>
                        <span className = {determineStatusClass(row.status)}>{row.status}</span>
                    </div>
                ))
            )}
            </div>
            </div>
            {
                viewAll && (
                    <div className = "recent-expenses-footer">
                    <Link href = "/expenses" className = "view-all-link">View All</Link>
            </div>
                )}
        </section>
    );
}
