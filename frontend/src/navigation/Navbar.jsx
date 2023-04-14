import React from "react"
import logo from "../assets/logo-04.png"

const Navbar = () => {
	return (
		<div class=".navbar-expand{-sm|-md|-lg|-xl|-xxl}">
			<div class="d-inline-flex p-2">
				<nav class="navbar navbar-toggleable-sm navbar-expand-lg bg-body-tertiary">
					<div class="container-fluid">
						{/* <a class="navbar-brand" href="#">
							Navbar
						</a> */}
						{/* <button
							class="navbar-toggler"
							type="button"
							data-bs-toggle="collapse"
							data-bs-target="#navbarSupportedContent"
							aria-controls="navbarSupportedContent"
							aria-expanded="false"
							aria-label="Toggle navigation"
						>
							<span class="navbar-toggler-icon"></span>
						</button> */}
						<img className="logo-icon" src={logo}></img>
						<div class="collapse navbar-collapse" id="navbarSupportedContent">
							<ul class="navbar-nav me-auto mb-2 mb-lg-0 list-unstyled">
								<li class="nav-item">
									<a class="nav-link active" aria-current="page" href="#">
										Explorer
									</a>
								</li>
								<li class="nav-item">
									<a class="nav-link" href="#">
										Wallet
									</a>
								</li>
								<li class="nav-item dropdown">
									<a
										class="nav-link dropdown-toggle"
										href="#"
										role="button"
										data-bs-toggle="dropdown"
										aria-expanded="false"
									>
										Transact
									</a>
									<ul class="dropdown-menu">
										<li>
											<a class="dropdown-item" href="#">
												Action
											</a>
										</li>
										<li>
											<a class="dropdown-item" href="#">
												Another action
											</a>
										</li>
										<li>
											<hr class="dropdown-divider" />
										</li>
										<li>
											<a class="dropdown-item" href="#">
												Something else here
											</a>
										</li>
									</ul>
								</li>
								<li class="nav-item">
									<a class="nav-link" href="#">
										Faucet
									</a>
								</li>
							</ul>
							{/* <form class="d-flex" role="search">
                <input
                  class="form-control me-2"
                  type="search"
                  placeholder="Search"
                  aria-label="Search"
                />
                <button class="btn btn-outline-success" type="submit">
                  Search
                </button>
              </form> */}
						</div>
					</div>
				</nav>
			</div>
		</div>
	)
}
export default Navbar
