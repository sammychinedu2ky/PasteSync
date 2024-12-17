
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.Extensions.Logging;
using StackExchange.Redis;

namespace Aspire.Hosting;
 internal static class RedisResourceBuilderExtension
 {
    public static IResourceBuilder<RedisResource> WithAddCustomPage(this IResourceBuilder<RedisResource> builder)
    {
        builder.WithCommand(
            name: "custom-page",
            displayName: "Custom Page",
            executeCommand: context => OnRunAddCustomPageAsync(builder, context),
            updateState: OnUpdateResourceSate,
            iconName: "AddSquare"
        );
        return builder;
    }

    private static ResourceCommandState OnUpdateResourceSate(UpdateCommandStateContext context)
    {
        if(context.ResourceSnapshot.HealthStatus == HealthStatus.Healthy)
        {
            return ResourceCommandState.Enabled;
        }
        return ResourceCommandState.Disabled;
    }

    private static async Task<ExecuteCommandResult> OnRunAddCustomPageAsync(IResourceBuilder<RedisResource> builder, ExecuteCommandContext context)
    {
        var connectionString = await builder.Resource.GetConnectionStringAsync() ??
        throw new InvalidOperationException(
            $"Unable to obtain {context.ResourceName} connection string"
        );
        await using var connection = ConnectionMultiplexer.Connect(connectionString);
        var db = connection.GetDatabase();
        await db.HashSetAsync("custom-page", new HashEntry[]
        {
            new HashEntry("data", "This is just a custom data 😅")
        });
        return CommandResults.Success();
    }
}