import '../assets/scss/pages/dashboard-v2.scss'
import Type1V3 from '../components/cards/complete/Type1v3'
import Type5V1 from '../components/cards/standard/Type5v1'
import Type7 from '../components/cards/standard/Type7'
import UserRobotProfits from '../components/UserRobotProfits'

export default function Dashboard() {
	return (
		<div className='container container--dashboard-v2'>
			<div className='container container--dashboard'>
				<div className='dashboard__group dashboard__group--outer'>
					<Type1V3 />
					<div className='dashboard__group dashboard__group--middle'>
						<div className='dashboard__group dashboard__group--inner'>
							<Type7 />
							<Type5V1 />
						</div>
						<div className='dashboard__group dashboard__group--inner'>
							<UserRobotProfits />
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
