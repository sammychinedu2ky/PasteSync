using AppHost.Hosting;

var builder = DistributedApplication.CreateBuilder(args);

var cache = builder.AddRedis("cache").WithAddCustomPage().WithRedisInsight();


var backendApi = builder.AddProject<Projects.backend>("backend")
.WithReference(cache)
.WaitFor(cache)
.WithHttpEndpoint(name: "backend", port: 5000);

var frontend = builder.AddNpmApp("frontend", "../frontend", "dev")
.WithReference(backendApi)
.WithHttpEndpoint(env: "PORT", port: 3000)
.WaitFor(backendApi)
.ExcludeFromManifest();
builder.Build().Run();
